-- ==============================================================================
-- VERIFY SUPER ADMIN: skamitboss4148@gmail.com
-- ==============================================================================
SELECT 
  au.id AS auth_user_id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  adm.is_super_admin,
  adm.is_active,
  ARRAY_AGG(p.permission_group ORDER BY p.permission_group) AS permissions
FROM auth.users au
JOIN public.admin_users adm ON adm.id = au.id
LEFT JOIN public.admin_permissions p ON p.admin_id = adm.id
WHERE au.email = 'skamitboss4148@gmail.com'
GROUP BY au.id, au.email, au.created_at, au.last_sign_in_at, adm.is_super_admin, adm.is_active;
