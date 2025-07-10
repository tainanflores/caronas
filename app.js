import { firebaseConfig } from "./firebaseConfig.js";
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
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";


// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const messaging = getMessaging();

// --- FUNÇOES DE MENSAGENS PUSH ---
Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
        getToken(messaging, {
            vapidKey: 'BNqChjRQpFe_6xZcJs6IBtdkSj9Rjask1KK_-EVli-vxjsxfSvlj9A44vE6i7wuoWhcp80Zi4pISyTjQ-RZ2no0'
        }).then((currentToken) => {
            if (currentToken) {
                console.log('Token FCM:', currentToken);
                // Você pode salvar esse token no Firestore para enviar push por backend depois
            } else {
                console.warn('Nenhum token disponível. Permissão não concedida?');
            }
        }).catch((err) => {
            console.error('Erro ao buscar token:', err);
        });
    } else {
        console.warn('Permissão de notificação negada');
    }
});

onMessage(messaging, (payload) => {
    console.log('Notificação recebida em foreground:', payload);
    new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icons/icon-192.png'
    });
});

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

const appSection = document.getElementById("appSection");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

const enterQueueBtn = document.getElementById("enterQueueBtn");
const confirmRideBtn = document.getElementById("confirmRideBtn");
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
    clearInputs();
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
        showMessage("Login realizado com sucesso!", false);
    } catch (error) {
        if (error.code === "auth/wrong-password") {
            showMessage("Senha incorreta.");
        } else if (error.code === "auth/user-not-found") {
            showMessage("Usuário não encontrado. Cadastre-se.");
        } else if (error.code === "auth/invalid-email") {
            showMessage("Email inválido.");
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
        await setDoc(doc(db, "queue", currentUser.uid), { timestamp: serverTimestamp() });
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
        // Remove do início da fila e insere no fim (timestamp novo)
        await deleteDoc(doc(db, "queue", currentUser.uid));
        await setDoc(doc(db, "queue", currentUser.uid), { timestamp: serverTimestamp() });
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

    userInfo.textContent = `Olá, ${userData.name}`;

    // Verifica se está na fila
    const inQueue = userData.inQueue === true;

    enterQueueBtn.style.display = inQueue ? "none" : "inline-block";
    confirmRideBtn.style.display = "none"; // inicialmente escondido

    // Busca fila ordenada por timestamp
    const q = query(collection(db, "queue"), orderBy("timestamp"));
    const snapshot = await getDocs(q);

    // Mostra fila no UI
    queueList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        let listNumber = queueList.children.length + 1;
        const id = docSnap.id;
        const time = docSnap.data().timestamp?.toDate();
        const user = id === currentUser.uid ? "(Você)" : "";
        queueList.innerHTML += `<li>${listNumber} - ${user} - ${currentUser.displayName}</li>`;
        if (id === currentUser.uid) {
            queueList.lastElementChild.style.backgroundColor = "#00F505"; // destaque verde limao
        }
    });

    // Se estiver na fila e for o primeiro, mostra botão confirmar
    const firstInQueue = snapshot.docs[0]?.id;
    if (inQueue && firstInQueue === currentUser.uid) {
        confirmRideBtn.style.display = "inline-block";

    }
}

// --- MONITORA AUTENTICAÇÃO ---

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        clearInputs();
        await updateUI();
        showSection(appSection);
    } else {
        currentUser = null;
        clearInputs();
        showSection(loginForm);
    }
});
