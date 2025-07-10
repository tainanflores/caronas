import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    updateDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    limit,
    orderBy,
    query,
    onSnapshot,
    where
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCefSZfaZj5mKSowZUYhwE-5V9nBc04GiE",
    authDomain: "caronastj.firebaseapp.com",
    projectId: "caronastj",
    storageBucket: "caronastj.firebasestorage.app",
    messagingSenderId: "837892083232",
    appId: "1:837892083232:web:63f3b7299bafef95df3645"
};

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const messaging = getMessaging();

// onMessage(messaging, (payload) => {
//     console.log('Notificação recebida em foreground:', payload);
//     if (document.visibilityState === 'visible') {
//         new Notification(payload.notification.title, {
//             body: payload.notification.body,
//             icon: '/icons/icon-192.png'
//         });
//     }

// });

// --- ELEMENTOS ---
const messageEl = document.getElementById("message");

// Forms e botões
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const recoverForm = document.getElementById("recoverForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerBtn = document.getElementById("registerBtn");

const recoverEmail = document.getElementById("recoverEmail");
const recoverBtn = document.getElementById("recoverBtn");

const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const showRecoverBtn = document.getElementById("showRecoverBtn");
const showLoginFromRecoverBtn = document.getElementById("showLoginFromRecoverBtn");

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
// const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

const enterQueueBtn = document.getElementById("enterQueueBtn");
const confirmRideBtn = document.getElementById("confirmRideBtn");
const skipRideBtn = document.getElementById("skipRideBtn");
const topMenu = document.getElementById("topMenu");

const queueList = document.getElementById("queueList");

const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const leaveQueueMenuBtn = document.getElementById("leaveQueueMenuBtn");

// --- VARIÁVEL DE CONTROLE ---
let currentUser = null;

// --- FUNÇÕES AUXILIARES ---

function showMessage(text, isError = true) {
    messageEl.textContent = text;
    messageEl.style.backgroundColor = isError ? "#d23f3f" : "#2563eb"; // azul para sucesso
    messageEl.style.borderLeftColor = isError ? "#a00" : "#1c4ed8";
    messageEl.style.display = "block";

    if (text) {
        setTimeout(() => {
            messageEl.style.display = "none";
            messageEl.textContent = "";
        }, 2000);
    }
}


function clearInputs() {
    loginEmail.value = "";
    loginPassword.value = "";
    registerName.value = "";
    registerEmail.value = "";
    registerPassword.value = "";
    recoverEmail.value = "";
}

function showSection(section) {
    // Esconde todos
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    recoverForm.classList.add("hidden");
    authSection.classList.add("hidden");
    appSection.classList.add("hidden");


    // Mostra o pedido
    section.classList.remove("hidden");
    // showMessage("",false); // limpa mensagem
}

function validateEmail(email) {
    // RegEx simples
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function sanitizeName(name) {
    return name.trim();
}

// --- TROCA DE FORMULÁRIOS ---

showRegisterBtn.onclick = () => {
    clearInputs();
    showSection(registerForm);
};

showLoginBtn.onclick = () => {
    clearInputs();
    showSection(loginForm);
};

showRecoverBtn.onclick = () => {
    recoverEmail.value = loginEmail.value;
    // clearInputs();
    showSection(recoverForm);

};

showLoginFromRecoverBtn.onclick = () => {
    clearInputs();
    showSection(loginForm);
};

// --- CADASTRO ---

registerBtn.onclick = async () => {
    const name = sanitizeName(registerName.value);
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!name) {
        showMessage("Por favor, insira seu nome completo.");
        return;
    }
    if (!validateEmail(email)) {
        showMessage("Email inválido.");
        return;
    }
    if (!validatePassword(password)) {
        showMessage("Senha deve ter pelo menos 6 caracteres.");
        return;
    }

    try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = userCred.user;
        // Salva no Firestore com campo name e role user
        await setDoc(doc(db, "users", currentUser.uid), {
            name,
            email,
            role: "user",
            inQueue: false
        });

        await updateProfile(currentUser, {
            displayName: name
        });

        showMessage("Cadastro realizado com sucesso!", false);
        clearInputs();
        showSection(appSection);
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            showMessage("Esse email já está cadastrado. Por favor, faça login.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("Email inválido.");
        } else if (error.code === "auth/weak-password") {
            showMessage("Senha muito fraca. Use 6 ou mais caracteres.");
        } else {
            showMessage("Erro ao cadastrar: " + error.message);
        }
    }
};

// --- LOGIN ---

loginBtn.onclick = async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const remember = document.getElementById('rememberLogin').checked;

    if (!validateEmail(email)) {
        showMessage("Email inválido.");
        return;
    }
    if (!validatePassword(password)) {
        showMessage("Senha deve ter pelo menos 6 caracteres.");
        return;
    }

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCred.user;
        clearInputs();
        showSection(appSection);

        if (remember) {
            localStorage.setItem('savedLoginEmail', email);
        } else {
            localStorage.removeItem('savedLoginEmail');
        }
        showMessage("Login realizado com sucesso!", false);
    } catch (error) {
        if (error.code === "auth/wrong-password") {
            showMessage("Senha incorreta.");
        } else if (error.code === "auth/user-not-found") {
            showMessage("Usuário não encontrado. Cadastre-se.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("Email inválido.");
        } else if (error.code === "auth/too-many-requests") {
            showMessage("Muitas tentativas de login. Tente novamente mais tarde.");
        } else if (error.code === "auth/invalid-credential") {
            showMessage("Senha inválida. Tente novamente ou clique 'em esqueci minha senha'.");
        } else {
            showMessage("Erro ao logar: " + error.message);
        }
    }
};

// --- LOGOUT ---

logoutBtn.onclick = async () => {
    try {
        await signOut(auth);
        currentUser = null;
        clearInputs();
        showSection(loginForm);
        showMessage("Você saiu do app.", false);
    } catch (error) {
        showMessage("Erro ao sair: " + error.message);
    }
};

// --- RECUPERAR SENHA ---

recoverBtn.onclick = async () => {
    const email = recoverEmail.value.trim();

    if (!validateEmail(email)) {
        showMessage("Email inválido.");
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showMessage("Link de recuperação enviado. Verifique seu email.", false);
        recoverEmail.value = "";
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            showMessage("Email não cadastrado.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("Email inválido.");
        } else {
            showMessage("Erro ao enviar link: " + error.message);
        }
    }
};

// --- MENU 3 PONTOS ---

menuBtn.onclick = () => {
    menuDropdown.classList.toggle("hidden");
};

document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.add("hidden");
    }
});

// --- SAIR DA FILA PELO MENU COM CONFIRMAÇÃO ---

leaveQueueMenuBtn.onclick = async () => {
    menuDropdown.classList.add("hidden");
    if (!currentUser) return;

    const confirmed = confirm("Tem certeza que deseja sair da fila?");
    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, "queue", currentUser.uid));
        await updateDoc(doc(db, "users", currentUser.uid), { inQueue: false });
        showMessage("Você saiu da fila.", false);
        await updateUI();
    } catch (error) {
        showMessage("Erro ao sair da fila: " + error.message);
    }
};

// --- ENTRAR NA FILA ---

enterQueueBtn.onclick = async () => {
    if (!currentUser) return;

    try {
        const filaRef = collection(db, "queue");
        const q = query(filaRef, orderBy("queueSpot", "asc"), limit(1));
        const snapshot = await getDocs(q);
        const menorQueueSpot = snapshot.empty ? 0 : snapshot.docs[0].data().queueSpot - 1;

        await setDoc(doc(db, "queue", currentUser.uid), { queueSpot: menorQueueSpot });
        await updateDoc(doc(db, "users", currentUser.uid), { inQueue: true });
        showMessage("Você entrou na fila.", false);
        await updateUI();
    } catch (error) {
        showMessage("Erro ao entrar na fila: " + error.message);
    }
};


// --- CONFIRMAR CARONA ---
confirmRideBtn.onclick = async () => {
    if (!currentUser) return;

    try {
        const filaRef = collection(db, "queue");
        const q = query(filaRef, orderBy("queueSpot", "desc"), limit(1));
        const snapshot = await getDocs(q);
        const maiorQueueSpot = snapshot.empty ? 0 : snapshot.docs[0].data().queueSpot + 1;

        await updateDoc(doc(db, "queue", currentUser.uid), { queueSpot: maiorQueueSpot });
        showMessage("Carona confirmada. Você foi para o final da fila.", false);
        await updateUI();
    } catch (error) {
        showMessage("Erro ao confirmar carona: " + error.message);
    }
};

// --- ATUALIZA INTERFACE ---

async function updateUI() {
    if (!currentUser) {
        topMenu.classList.add("hidden");
        showSection(loginForm);
        return;
    }

    topMenu.classList.remove("hidden");

    // Atualiza dados do usuário
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    if (!userData) {
        showMessage("Dados do usuário não encontrados.");
        return;
    }

    // userInfo.textContent = `Olá, ${userData.name}`;

    // Verifica se está na fila
    const inQueue = userData.inQueue === true;

    enterQueueBtn.style.display = inQueue ? "none" : "inline-block";
    confirmRideBtn.style.display = "none"; // inicialmente escondido

    // Busca fila ordenada por timestamp
    const q = query(collection(db, "queue"), orderBy("queueSpot", "asc"));
    const snapshot = await getDocs(q);

    // Se estiver na fila e for o primeiro, mostra botão confirmar
    const firstInQueue = snapshot.docs[0]?.id;
    if (inQueue && firstInQueue === currentUser.uid) {
        confirmRideBtn.style.display = "inline-block";
        skipRideBtn.classList.remove("hidden");
    }
}

function startListeningQueue() {
    const filaRef = collection(db, "queue");
    const q = query(filaRef, orderBy("queueSpot", "asc"));

    onSnapshot(q, async (snapshot) => {
        queueList.innerHTML = "";

        // Usar for..of para poder usar await dentro do loop
        for (const docSnap of snapshot.docs) {
            const userId = docSnap.id;
            const userDataSnap = await getDoc(doc(db, "users", userId));
            const userData = userDataSnap.exists() ? userDataSnap.data() : { name: "Usuário" };

            const isCurrentUser = userId === currentUser?.uid;
            const listNumber = queueList.children.length + 1;

            const li = document.createElement("li");
            li.textContent = `${listNumber} - ${userData.name} ${isCurrentUser ? "(Você)" : ""}`;
            if (isCurrentUser) {
                li.style.backgroundColor = "#00F505"; // destaque verde limão
            }
            queueList.appendChild(li);
        }
        updateUI();
    });
}

// --- MONITORA AUTENTICAÇÃO ---                     vapidKey: 'BNqChjRQpFe_6xZcJs6IBtdkSj9Rjask1KK_-EVli-vxjsxfSvlj9A44vE6i7wuoWhcp80Zi4pISyTjQ-RZ2no0'


onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const currentToken = await getToken(messaging, {
                    vapidKey: 'BNqChjRQpFe_6xZcJs6IBtdkSj9Rjask1KK_-EVli-vxjsxfSvlj9A44vE6i7wuoWhcp80Zi4pISyTjQ-RZ2no0'
                });

                if (currentToken) {
                    if (currentUser) {
                        await saveTokenForUser(currentUser.uid, currentToken);
                    }
                } else {
                    console.warn('Nenhum token disponível.');
                }
            } else {
                console.warn('Permissão de notificação negada.');
            }
        } catch (err) {
            console.error('Erro ao obter ou salvar token:', err);
        }

        clearInputs();
        startListeningQueue();
        await updateUI();
        showSection(appSection);
    } else {
        currentUser = null;
        clearInputs();
        showSection(loginForm);
    }
});

// --- FUNÇÕES DE TOKEN ---

async function saveTokenForUser(uid, currentToken) {
    try {
        const tokensRef = collection(db, "fcmTokens", uid, "tokens");

        // Verifica se o token já existe
        const q = query(tokensRef, where("token", "==", currentToken));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Token já existe, apenas atualiza o timestamp
            querySnapshot.forEach(async (docSnap) => {
                await updateDoc(docSnap.ref, {
                    createdAt: serverTimestamp()
                });
            });
            console.log("Token já existia, timestamp atualizado.");
        } else {
            // Token novo, adiciona ao Firestore
            await addDoc(tokensRef, {
                token: currentToken,
                createdAt: serverTimestamp()
            });
            console.log("Token salvo no Firestore.");
        }
    } catch (error) {
        console.error("Erro ao salvar/verificar token:", error);
    }
}

// teste funcços
// Mostrar/ocultar senha
document.querySelector('.toggle-password').onclick = function () {
    const input = this.previousElementSibling;
    if (input.type === "password") {
        input.type = "text";
        this.querySelector('img').src = "icons/visibility_off.svg"; // Ícone de ocultar senha
    } else {
        input.type = "password";
        this.querySelector('img').src = "icons/visibility.svg"; // Ícone de mostrar senha
    }
}

// Lembrar login
window.addEventListener('load', () => {
    const savedEmail = localStorage.getItem('savedLoginEmail');
    if (savedEmail) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('rememberLogin').checked = true;
    }
});

