// Authentication utility functions

export const getToken = () => {
  return localStorage.getItem("jwt");
};

export const setToken = (token) => {
  localStorage.setItem("jwt", token);
};

export const removeToken = () => {
  localStorage.removeItem("jwt");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  window.location.href = "/";
};

export function getAuth() {
  const token = localStorage.getItem("jwt");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isAdmin() {
  const auth = getAuth();
  return auth?.role === "ADMIN";
}

export function isTeacher() {
  const auth = getAuth();
  return auth?.role === "TEACHER";
}
