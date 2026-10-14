const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    loginError.textContent = "A verificar...";

    try {
        const resposta = await fetch("https://limpando7-backend-production.up.railway.app/pedidos", {
            method: "GET",
            headers: {
                "Authorization": "Basic " + btoa(`${username}:${password}`)
            }
        });

        console.log("Status do login:", resposta.status);

        if (resposta.ok) {
            sessionStorage.setItem(
                "limpando7_auth",
                btoa(`${username}:${password}`)
            );

            window.location.href = "dashboard.html";
            return;
        }

        loginError.textContent =
            `Falha na autenticação. Código: ${resposta.status}`;

    } catch (erro) {
        console.error("Erro no login:", erro);
        loginError.textContent = "Erro ao conectar com o backend.";
    }
});

window.addEventListener("load", () => {
    const splash = document.getElementById("nexusSplash");

    setTimeout(() => {
        splash.style.opacity = "0";

        setTimeout(() => {
            splash.style.display = "none";
        }, 500);

    }, 2500);
});