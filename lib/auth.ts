import type { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { supabaseAdmin } from '@/lib/supabase';
import type { Profile } from '@/types_db';

// Required environment variables
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

// Optional: Owner Discord ID for God Mode
const OWNER_DISCORD_ID = process.env.OWNER_DISCORD_ID || '';

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email' } },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/?error=auth_error', // Show error on home page
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log('\n========== 🔵 SIGN-IN CALLBACK START ==========');
      console.log('User Email:', user?.email);
      console.log('User Name:', user?.name);
      console.log('Discord ID:', (profile as any)?.id || account?.providerAccountId);

      // Timeout wrapper to prevent infinite hangs
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.error('\n⏰ SIGN-IN CALLBACK TIMEOUT! Forcing success after 5 seconds.');
          resolve(true);
        }, 5000); // 5 second timeout
      });

      const signInPromise = (async () => {
        // Try to save to database but don't block login if it fails
        try {
        const discordId = (profile as any)?.id?.toString() ?? account?.providerAccountId ?? '';
        const email = user.email ?? (profile as Record<string, any>)?.email?.toString();
        const avatarUrl = user.image ?? (profile as Record<string, any>)?.avatar;
        const username = user.name ?? (profile as Record<string, any>)?.username ?? '';

        console.log('\n📝 Data to save:');
        console.log('  - Discord ID:', discordId);
        console.log('  - Email:', email);
        console.log('  - Username:', username);
        console.log('  - Avatar URL:', avatarUrl);
        console.log('  - Supabase Admin Ready?', !!supabaseAdmin);
        console.log('  - Supabase URL set?', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('  - Supabase Service Key set?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        console.log('  - OWNER_DISCORD_ID from env:', OWNER_DISCORD_ID);

        if (!discordId) {
          console.error('\n❌ CRITICAL: No Discord ID found! Cannot save profile.');
          console.log('========== 🔵 SIGN-IN CALLBACK END ==========\n');
          return true;
        }

        if (!email) {
          console.error('\n❌ WARNING: No email found! Saving without email.');
        }

        if (!supabaseAdmin) {
          console.error('\n❌ CRITICAL: Supabase Admin client not initialized!');
          console.log('========== 🔵 SIGN-IN CALLBACK END ==========\n');
          return true;
        }

        // Determine role (owner check)
        let role: 'owner' | 'admin' | 'member' | 'guest' = 'guest';
        if (OWNER_DISCORD_ID && discordId === OWNER_DISCORD_ID) {
          role = 'owner';
          console.log('\n👑 OWNER DETECTED! Setting role to "owner"');
        }

        // Check if user already exists
        console.log('\n🔍 Checking if profile exists in database...');
        const { data: existingProfile, error: selectError } = await (supabaseAdmin as any)
          .from('profiles')
          .select('*')
          .eq('discord_id', discordId)
          .maybeSingle();

        if (selectError) {
          console.error('\n❌ Error checking profile:', selectError.message);
          console.error('Error Code:', selectError.code);
          console.error('Error Details:', JSON.stringify(selectError, null, 2));
        }

        if (existingProfile) {
          console.log('\n✅ Profile EXISTS! Updating...');
          console.log('Existing profile ID:', (existingProfile as any).id);

          const { data: updateData, error: updateError } = await (supabaseAdmin as any)
            .from('profiles')
            .update({
              email,
              avatar_url: avatarUrl,
              role, // Update role in case it changed (e.g., became owner)
            })
            .eq('discord_id', discordId)
            .select();

          if (updateError) {
            console.error('\n❌ UPDATE FAILED!');
            console.error('Error Message:', updateError.message);
            console.error('Error Code:', updateError.code);
            console.error('Error Details:', JSON.stringify(updateError, null, 2));
          } else {
            console.log('\n✅ PROFILE UPDATED SUCCESSFULLY!');
            console.log('Updated Data:', JSON.stringify(updateData, null, 2));
          }
        } else {
          console.log('\n🆕 Profile DOES NOT EXIST! Creating new profile...');

          const newProfile = {
            discord_id: discordId,
            email,
            avatar_url: avatarUrl,
            role,
            subscription_status: 'inactive' as const,
          };

          console.log('Data to insert:', JSON.stringify(newProfile, null, 2));

          const { data: insertData, error: insertError } = await (supabaseAdmin as any)
            .from('profiles')
            .insert(newProfile)
            .select();

          if (insertError) {
            console.error('\n❌ INSERT FAILED!');
            console.error('Error Message:', insertError.message);
            console.error('Error Code:', insertError.code);
            console.error('Error Hint:', insertError.hint);
            console.error('Error Details:', JSON.stringify(insertError, null, 2));
          } else {
            console.log('\n✅ PROFILE CREATED SUCCESSFULLY!');
            console.log('New Profile Data:', JSON.stringify(insertData, null, 2));
          }
        }
      } catch (error) {
        console.error('\n❌ EXCEPTION CAUGHT IN SIGN-IN CALLBACK!');
        console.error('Exception:', error);
        if (error instanceof Error) {
          console.error('Error Message:', error.message);
          console.error('Error Stack:', error.stack);
        }
      }

        console.log('\n✅ Login approved for:', user?.email);
        console.log('========== 🔵 SIGN-IN CALLBACK END ==========\n');
        return true;
      })();

      // Race between actual sign-in and timeout
      return Promise.race([signInPromise, timeoutPromise]);
    },
    async jwt({ token, user, account }) {
      console.log('\n========== 🟡 JWT CALLBACK START ==========');
      try {
        // Store Discord ID in token
        if (account?.providerAccountId) {
          token.discord_id = account.providerAccountId;
          console.log('Stored Discord ID in token:', token.discord_id);
        }

        if (token?.discord_id) {
          console.log('Fetching profile for Discord ID:', token.discord_id);

          const { data, error } = await (supabaseAdmin as any)
            .from('profiles')
            .select('id, role, discord_id')
            .eq('discord_id', token.discord_id as string)
            .maybeSingle();

          if (error) {
            console.error('❌ Error fetching profile in JWT callback:', error);
            token.role = 'guest';
            console.log('========== 🟡 JWT CALLBACK END ==========\n');
            return token;
          }

          if (!data) {
            console.log('⚠️ No profile found for Discord ID:', token.discord_id);
            token.role = 'guest';
            console.log('========== 🟡 JWT CALLBACK END ==========\n');
            return token;
          }

          console.log('✅ Profile found:', data);

          // Store the database UUID in token for session
          token.sub = data.id;

          let role = (data?.role as Profile['role']) ?? 'guest';

          // Owner backdoor: Override role if Discord ID matches
          if (OWNER_DISCORD_ID && data?.discord_id === OWNER_DISCORD_ID) {
            console.log('👑 OWNER MATCH! Upgrading role to owner');
            console.log('  - OWNER_DISCORD_ID:', OWNER_DISCORD_ID);
            console.log('  - User Discord ID:', data.discord_id);

            role = 'owner';

            // Persist owner role to database
            const { error: updateError } = await (supabaseAdmin as any)
              .from('profiles')
              .update({ role: 'owner' })
              .eq('discord_id', token.discord_id as string);

            if (updateError) {
              console.error('❌ Failed to update owner role:', updateError);
            } else {
              console.log('✅ Owner role updated in database');
            }
          }

          token.role = role;
          console.log('Final token role:', token.role);
        }

        console.log('========== 🟡 JWT CALLBACK END ==========\n');
        return token;
      } catch (error) {
        console.error('❌ JWT callback exception:', error);
        console.log('========== 🟡 JWT CALLBACK END ==========\n');
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.sub as string;
          session.user.role = (token.role as Profile['role']) ?? 'guest';
        }

        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
};
