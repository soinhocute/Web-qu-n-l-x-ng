const firebaseConfig = {
  apiKey: 'AIzaSyDQSc-BsOn4Ue9sjnUCPiQKZL6xx8NGF7M',
  projectId: 'web-quan-li-xuong'
};

const demoUsers = [
  {
    email: 'sinhvien@gmail.com',
    password: 'sinhvien001',
    fullName: 'Tai khoan Demo Sinh vien',
    role: 'student',
    code: 'SV001'
  },
  {
    email: 'gv@gmail.com',
    password: 'gv001.',
    fullName: 'Tai khoan Demo Giao vien',
    role: 'teacher',
    code: 'GV001'
  },
  {
    email: 'dt@gmail.com',
    password: 'doitac001',
    fullName: 'Tai khoan Demo Doi tac',
    role: 'partner',
    code: 'DT001',
    organization: 'Doi tac Demo'
  },
  {
    email: 'admin@gmail.com',
    password: 'admin001',
    fullName: 'Tai khoan Demo Admin',
    role: 'admin',
    code: 'ADMIN001'
  }
];

async function main() {
  const failures = [];

  for (const user of demoUsers) {
    try {
      const authUser = await createOrSignInUser(user);
      await upsertUserDocument(authUser, user);
      console.log(`OK ${user.email} -> ${user.role} (${authUser.localId})`);
    } catch (error) {
      failures.push(`${user.email}: ${error.message}`);
      console.error(`FAIL ${user.email}: ${error.message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Seed completed with ${failures.length} failure(s).`);
  }
}

async function createOrSignInUser(user) {
  const signUpResult = await callIdentityToolkit('accounts:signUp', {
    email: user.email,
    password: user.password,
    displayName: user.fullName,
    returnSecureToken: true
  });

  if (signUpResult.ok) {
    return signUpResult.data;
  }

  if (signUpResult.errorCode !== 'EMAIL_EXISTS') {
    throw new Error(`${user.email}: ${signUpResult.message}`);
  }

  const signInResult = await callIdentityToolkit('accounts:signInWithPassword', {
    email: user.email,
    password: user.password,
    returnSecureToken: true
  });

  if (!signInResult.ok) {
    throw new Error(
      `${user.email}: email da ton tai nhung mat khau hien tai khong khop. ` +
      'Can dat lai mat khau bang Firebase Console hoac script Firebase Admin.'
    );
  }

  await callIdentityToolkit('accounts:update', {
    idToken: signInResult.data.idToken,
    displayName: user.fullName,
    returnSecureToken: true
  });

  return signInResult.data;
}

async function callIdentityToolkit(method, body) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${method}?key=${firebaseConfig.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();
  if (response.ok) {
    return { ok: true, data };
  }

  return {
    ok: false,
    errorCode: data?.error?.message,
    message: data?.error?.message || response.statusText
  };
}

async function upsertUserDocument(authUser, user) {
  const now = new Date().toISOString();
  const document = {
    fields: {
      uid: { stringValue: authUser.localId },
      email: { stringValue: user.email },
      fullName: { stringValue: user.fullName },
      role: { stringValue: user.role },
      status: { stringValue: 'active' },
      createdAt: { timestampValue: now },
      updatedAt: { timestampValue: now },
      phone: { stringValue: '' },
      code: { stringValue: user.code || '' },
      organization: { stringValue: user.organization || '' },
      address: { stringValue: '' }
    }
  };

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${authUser.localId}`
  );

  for (const fieldName of Object.keys(document.fields)) {
    url.searchParams.append('updateMask.fieldPaths', fieldName);
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authUser.idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(document)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(`${user.email}: Firestore update failed: ${data?.error?.message || response.statusText}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
