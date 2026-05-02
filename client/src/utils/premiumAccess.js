export const PREMIUM_ACCOUNT_KEY = "everyStreetPremiumAccount";
export const PREMIUM_SESSION_KEY = "everyStreetPremiumSession";
export const LEGACY_PREMIUM_KEY = "everyStreetPremiumMember";

const readJson = (key) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const getPremiumAccount = () => {
  const account = readJson(PREMIUM_ACCOUNT_KEY);
  return account?.registrationComplete === true && account?.isPremium === true ? account : null;
};

export const getPremiumSession = () => {
  const account = getPremiumAccount();
  const session = readJson(PREMIUM_SESSION_KEY);

  if (!account || session?.isPremium !== true) return null;
  if (session.email?.toLowerCase() !== account.email?.toLowerCase()) return null;

  return {
    ...account,
    loggedInAt: session.loggedInAt
  };
};

export const hasPremiumAccess = () => Boolean(getPremiumSession());

export const savePremiumAccount = (account) => {
  window.localStorage.setItem(PREMIUM_ACCOUNT_KEY, JSON.stringify(account));
  window.localStorage.removeItem(LEGACY_PREMIUM_KEY);
};

export const savePremiumSession = (account) => {
  window.localStorage.setItem(PREMIUM_SESSION_KEY, JSON.stringify({
    email: account.email,
    isPremium: true,
    loggedInAt: new Date().toISOString()
  }));
};

export const clearPremiumSession = () => {
  window.localStorage.removeItem(PREMIUM_SESSION_KEY);
};
