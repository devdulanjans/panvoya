import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

function loginRedirect(context) {
  const callbackUrl = context.resolvedUrl || '/admin';
  return {
    redirect: {
      destination: `/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      permanent: false,
    },
  };
}

export async function requirePageSession(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session?.user) {
    return { redirect: loginRedirect(context).redirect };
  }
  return { session };
}

export async function requireAdminPageSession(context) {
  const result = await requirePageSession(context);
  if (result.redirect) return result;
  if (result.session.user.role !== 'ADMIN') {
    return { redirect: { destination: '/admin', permanent: false } };
  }
  return result;
}
