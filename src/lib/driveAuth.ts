import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace scopes
provider.addScope("https://www.googleapis.com/auth/drive.readonly");

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token in memory.
let cachedAccessToken: string | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Google Sign-In");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Extracts Google Drive / Doc / Sheet File ID from any shareable link.
 */
export const extractFileIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Try matching standard patterns
  // Pattern 1: /d/FILE_ID/
  const dPattern = /\/d\/([a-zA-Z0-9-_]+)/;
  const dMatch = url.match(dPattern);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  // Pattern 2: id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9-_]+)/;
  const idMatch = url.match(idPattern);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // Fallback: If it's a raw alphanumeric token of standard length (usually 33-44 chars)
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9-_]{28,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};

/**
 * Fetches name and parses text/string content of a Google Drive File.
 * Handles Google Documents, Spreadsheets, and plain files.
 */
export const fetchDriveFileContent = async (
  fileId: string, 
  accessToken: string
): Promise<{ name: string; content: string }> => {
  // 1. Fetch metadata first to know the name and mimeType
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Failed to read file metadata: ${errText || metaRes.statusText}`);
  }

  const metadata = await metaRes.json();
  const { name, mimeType } = metadata;

  // 2. Fetch content based on mimeType
  let content = "";

  if (mimeType === "application/vnd.google-apps.document") {
    // Google Doc -> export as plain text
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!exportRes.ok) {
      throw new Error(`Failed to export Google Document: ${exportRes.statusText}`);
    }
    content = await exportRes.text();
  } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
    // Google Sheet -> export as CSV
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!exportRes.ok) {
      throw new Error(`Failed to export Google Spreadsheet: ${exportRes.statusText}`);
    }
    content = await exportRes.text();
  } else if (mimeType === "application/vnd.google-apps.presentation") {
    // Google Slides -> export as plain text
    const exportRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!exportRes.ok) {
      throw new Error(`Failed to export Google Slides: ${exportRes.statusText}`);
    }
    content = await exportRes.text();
  } else {
    // Normal file (text/pdf/xlsx)
    // For safety, let's download alt=media and try to decode as text
    const mediaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!mediaRes.ok) {
      throw new Error(`Failed to download file content: ${mediaRes.statusText}`);
    }
    
    // Check if it looks like a readable text or spreadsheet file
    if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml") || mimeType.includes("csv")) {
      content = await mediaRes.text();
    } else {
      // If it's a binary file (PDF, Docx), plain download text representation might be messy,
      // but we will pass whatever character decoding we can get or list metadata
      content = `[Binary file content of type ${mimeType}. Direct text extraction is limited. Metadata parsed successfully.]`;
    }
  }

  return {
    name: name || "Untitled Google Drive File",
    content: content || "No readable text content extracted from file."
  };
};
