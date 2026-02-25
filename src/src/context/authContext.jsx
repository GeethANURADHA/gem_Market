import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(/** @type {{
  session: import('@supabase/supabase-js').Session | null,
  user: import('@supabase/supabase-js').User | null,
  isAdmin: boolean,
  loading: boolean,
  login: (email: string, password: string) => Promise<{user: import('@supabase/supabase-js').User | null, error: string | null}>,
  signUp: (email: string, password: string, fullName: string) => Promise<{user: import('@supabase/supabase-js').User | null, error: string | null}>,
  logout: () => Promise<void>,
  checkAdminRole: (userId: string, email: string) => Promise<boolean>,
} | undefined} */ (undefined));

/** @param {{ children: React.ReactNode }} props */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(/** @type {import('@supabase/supabase-js').Session | null} */ (null));
  const [user, setUser] = useState(/** @type {import('@supabase/supabase-js').User | null} */ (null));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Check if a given user ID or email has admin role
   * @param {string} userId
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  const checkAdminRole = async (userId, email) => {
    console.log('[Auth] Checking admin role for:', { userId, email });
    
    try {
      // Check for user_id OR email match
      const queryPromise = supabase
        .from('admin_roles')
        .select('id, user_id')
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin role query timed out')), 4000)
      );

      /** @type {any} */
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('[Auth] Admin check error:', error);
        return false;
      }
      
      if (data) {
        console.log('[Auth] Admin role found:', data);
        // If we found a match by email but user_id is missing, link it now
        if (!data.user_id && userId) {
          console.log('[Auth] Linking user_id to admin email account...');
          await supabase.from('admin_roles').update({ user_id: userId }).eq('id', data.id);
        }
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('[Auth] Admin check exception:', (/** @type {any} */ (err)).message);
      return false;
    }
  };

  useEffect(() => {
    // Load initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const isMasterAdmin = session.user.email === 'vetrovivo.lk@gmail.com';
          const dbAdminStatus = await checkAdminRole(session.user.id, session.user.email ?? '');
          setIsAdmin(isMasterAdmin || dbAdminStatus);
        }
      } catch (err) {
        console.error('Auth initialization failed:', (/** @type {any} */ (err)).message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Fail-safe: Ensure loading is cleared after 5 seconds
    const timeout = setTimeout(() => {
      setLoading(current => {
        if (current) console.warn('Auth loading timed out after 5s');
        return false;
      });
    }, 5000);

    // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            // Check admin status with email-based fallback for the master admin
            const isMasterAdmin = currentUser.email === 'vetrovivo.lk@gmail.com';
            const dbAdminStatus = await checkAdminRole(currentUser.id, currentUser.email ?? '');
            setIsAdmin(isMasterAdmin || dbAdminStatus);
          } else {
            setIsAdmin(false);
          }
          setLoading(false);
        }
      );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user: import('@supabase/supabase-js').User | null, error: string | null}>}
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  };

  /**
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @returns {Promise<{user: import('@supabase/supabase-js').User | null, error: string | null}>}
   */
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, login, signUp, logout, checkAdminRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
