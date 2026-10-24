// =====================================================
// LIMPANDO7 — DASHBOARD ADMINISTRATIVO
// =====================================================

const auth = sessionStorage.getItem("limpando7_auth");

if (!auth) {
    window.location.href = "login.html";
}

const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://limpando7-backend-production.up.railway.app";

const API_URL = `${API_BASE_URL}/pedidos`;

let pedidosDashboard = [];


// =====================================================
// INICIAR DASHBOARD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    carregarPedidos();

    carregarAvaliacoesPendentes();

    carregarAvaliacoesAprovadas();



    const filtro = document.getElementById("filtroStatus");

    if (filtro) {
        filtro.addEventListener("change", () => {
            mostrarPedidos(pedidosDashboard);
        });
    }

    const fecharModal =
        document.getElementById("fecharPedidoModal");

    if (fecharModal) {
        fecharModal.addEventListener(
            "click",
            fecharPedidoModal
        );
    }

    const overlay =
        document.querySelector(".modal-overlay");

    if (overlay) {
        overlay.addEventListener(
            "click",
            fecharPedidoModal
        );
    }

    document.addEventListener("keydown", (evento) => {

        if (evento.key === "Escape") {
            fecharPedidoModal();
        }

    });

});


// =====================================================
// BUSCAR PEDIDOS
// =====================================================

async function carregarPedidos() {

    try {

        const resposta = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": "Basic " + sessionStorage.getItem("limpando7_auth")
            }
        });

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar os pedidos."
            );
        }

        const pedidos = await resposta.json();

        pedidosDashboard = pedidos;

        // Mantém compatibilidade com a lógica recuperada
        window.pedidosDashboard = pedidos;

        mostrarPedidos(pedidos);

    } catch (erro) {

        console.error(
            "Erro ao carregar pedidos:",
            erro
        );

    }

}


// =====================================================
// MOSTRAR PEDIDOS
// =====================================================

function mostrarPedidos(pedidos) {

    const tabela =
        document.getElementById("ordersTableBody");

    if (!tabela) {
        console.error(
            "Tabela de pedidos não encontrada."
        );
        return;
    }


    // -------------------------------------------------
    // LISTA COMPLETA PARA ESTATÍSTICAS
    // -------------------------------------------------

    const listaCompleta =
        window.pedidosDashboard || pedidos;


    // -------------------------------------------------
    // ESTATÍSTICAS
    // -------------------------------------------------

    const novos =
        listaCompleta.filter(
            pedido =>
                normalizarStatus(pedido.status) === "Novo"
        ).length;

    const agendados =
        listaCompleta.filter(
            pedido =>
                normalizarStatus(pedido.status) === "Agendado"
        ).length;

    const concluidos =
        listaCompleta.filter(
            pedido =>
                normalizarStatus(pedido.status) === "Concluído"
        ).length;


    // -------------------------------------------------
    // ATUALIZAR CARTÕES
    // -------------------------------------------------

    const totalElemento =
        document.getElementById("totalPedidos");

    const novosElemento =
        document.getElementById("novosPedidos");

    const agendadosElemento =
        document.getElementById("agendadosPedidos");

    const concluidosElemento =
        document.getElementById("concluidosPedidos");


    if (totalElemento) {
        totalElemento.textContent =
            listaCompleta.length;
    }

    if (novosElemento) {
        novosElemento.textContent =
            novos;
    }

    if (agendadosElemento) {
        agendadosElemento.textContent =
            agendados;
    }

    if (concluidosElemento) {
        concluidosElemento.textContent =
            concluidos;
    }


    // -------------------------------------------------
    // FILTRO
    // -------------------------------------------------

    const filtro =
        document.getElementById("filtroStatus");

    const estadoSelecionado =
        filtro ? filtro.value : "todos";

    let pedidosExibidos = pedidosDashboard;

    if (
        estadoSelecionado &&
        estadoSelecionado !== "todos"
    ) {

        pedidosExibidos =
            pedidos.filter(pedido =>
                normalizarStatus(pedido.status) ===
                estadoSelecionado
            );

    }


    // -------------------------------------------------
    // LIMPAR TABELA
    // -------------------------------------------------

    tabela.innerHTML = "";

    // -------------------------------------------------
    // MOSTRAR PEDIDOS
    // -------------------------------------------------

    pedidosExibidos.forEach((pedido) => {

        const linha =
            document.createElement("tr");

        const status =
            normalizarStatus(pedido.status);

        const classeStatus =
            obterClasseStatus(status);

        const data =
            formatarData(pedido.data);


        linha.innerHTML = `

        <td>
            ${pedido.id || "-"}
        </td>

        <td>
            ${pedido.nome || "-"}
        </td>

        <td>
            ${pedido.servico || "-"}
        </td>

        <td>
            ${data}
        </td>

        <td>
            ${pedido.horario || "-"}
        </td>

        <td>
            <span class="status ${classeStatus}">
                ${status}
            </span>
        </td>

        <td>

            <button
                type="button"
                class="table-action"
                data-pedido-id="${pedido.id}"
            >
                Ver
            </button>

        </td>

    `;

        tabela.appendChild(linha);

    });

}

// =====================================================
// BUSCAR AVALIAÇÕES PENDENTES
// =====================================================
//
// Esta função busca as avaliações que ainda
// aguardam aprovação do administrador.
//
// IMPORTANTE:
// - Usa a autenticação do Dashboard.
// - Não interfere na tabela de pedidos.
// - Fica FORA da função mostrarPedidos().
// =====================================================

async function carregarAvaliacoesPendentes() {
    try {
        const resposta = await fetch(

            `${API_BASE_URL}/avaliacoes?status=PENDENTE`,

            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Basic " +
                        sessionStorage.getItem("limpando7_auth")
                }
            }
        );

        if (!resposta.ok) {
            throw new Error(
                "Não foi possível carregar as avaliações."
            );
        }

        const avaliacoes = await resposta.json();

        console.log("Avaliações pendentes:", avaliacoes);

        const container = document.getElementById(
            "avaliacoesContainer"
        );

        if (!container) {
            console.error(
                "Container de avaliações não encontrado."
            );
            return;
        }

        container.innerHTML = "";

        if (avaliacoes.length === 0) {
            container.innerHTML = `
                <p>Não existem avaliações pendentes.</p>
            `;
            return;
        }

        avaliacoes.forEach((avaliacao) => {
            const card = document.createElement("article");
            card.className = "avaliacao-admin-card";

            const nota = Math.max(
                0,
                Math.min(5, Number(avaliacao.nota) || 0)
            );

            const estrelas =
                "★".repeat(nota) + "☆".repeat(5 - nota);

            let imagem = "";

            if (avaliacao.foto) {
                imagem = `
                    <img
                        src="${API_BASE_URL}/uploads/${avaliacao.foto}"
                        alt="Foto enviada por ${avaliacao.nome || "cliente"}"
                        class="avaliacao-admin-foto"
                    >
                `;
            }

            card.innerHTML = `
                ${imagem}

                <div class="avaliacao-admin-conteudo">
                    <h3>${avaliacao.nome || "-"}</h3>

                    <div class="avaliacao-admin-estrelas">
                        ${estrelas}
                    </div>

                    <p class="avaliacao-admin-comentario">
                        ${avaliacao.comentario || "-"}
                    </p>

                    <span class="avaliacao-admin-status">
                        ${avaliacao.status || "PENDENTE"}
                    </span>
                </div>

                <div class="avaliacao-admin-acoes">
                    <button
                        type="button"
                        class="btn-aprovar-avaliacao"
                        data-avaliacao-id="${avaliacao.id}"
                    >
                        Aprovar
                    </button>

                    <button
                        type="button"
                        class="btn-rejeitar-avaliacao"
                        data-avaliacao-id="${avaliacao.id}"
                    >
                        Rejeitar
                    </button>

                    <button
                        type="button"
                        class="btn-excluir-avaliacao"
                        data-avaliacao-id="${avaliacao.id}"
                    >
                        Excluir
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (erro) {
        console.error(
            "Erro ao carregar avaliações:",
            erro
        );
    }

}


async function carregarAvaliacoesAprovadas() {
    const container = document.getElementById("avaliacoesAprovadasContainer");

    if (!container) return;

    try {
        const resposta = await fetch(
            `${API_BASE_URL}/avaliacoes/aprovadas`,
            {
                method: "GET",
                headers: {
                    "Authorization": "Basic " +
                        sessionStorage.getItem("limpando7_auth")
                }
            }
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar avaliações aprovadas.");
        }

        const avaliacoes = await resposta.json();

        container.innerHTML = "";

        if (avaliacoes.length === 0) {
            container.innerHTML = "<p>Não existem avaliações aprovadas.</p>";
            return;
        }

        avaliacoes.forEach((avaliacao) => {
            const card = document.createElement("article");
            card.className = "avaliacao-admin-card";

            const nota = Math.max(0, Math.min(5, Number(avaliacao.nota) || 0));
            const estrelas = "★".repeat(nota) + "☆".repeat(5 - nota);

            card.innerHTML = `
                <div class="avaliacao-admin-conteudo">
                    <h3>${avaliacao.nome || "-"}</h3>
                    <div class="avaliacao-admin-estrelas">${estrelas}</div>
                    <p class="avaliacao-admin-comentario">${avaliacao.comentario || "-"}</p>
                    <span class="avaliacao-admin-status">${avaliacao.status || "APROVADA"}</span>
                </div>

                <div class="avaliacao-admin-acoes">
                    <button
                        type="button"
                        class="btn-excluir-avaliacao"
                        data-avaliacao-id="${avaliacao.id}"
                    >
                        Excluir
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar avaliações aprovadas:", erro);
    }
}


    
async function excluirAvaliacao(id) {
    const confirmar = confirm(
        "Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(
            `${API_BASE_URL}/avaliacoes/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: "Basic " + sessionStorage.getItem("limpando7_auth")
                }
            }
        );

        if (!resposta.ok) {
    const detalhe = await resposta.text();

    console.error("Falha ao excluir avaliação:", {
        id: id,
        status: resposta.status,
        resposta: detalhe
    });

    throw new Error(
        `Erro ao excluir avaliação. HTTP ${resposta.status}`
    );
}

        alert("Avaliação excluída com sucesso!");

        await carregarAvaliacoesPendentes();

    } catch (erro) {
        console.error("Erro ao excluir avaliação:", erro);
        alert("Não foi possível excluir a avaliação.");
    }
} 

// =====================================================
// APROVAR AVALIAÇÃO
// =====================================================
//
// Esta função altera somente o status da avaliação.
//
// Fluxo:
// PENDENTE → APROVADA
//
// Depois de aprovada, ela deixa de aparecer na lista
// porque o Dashboard busca somente avaliações PENDENTES.
// =====================================================

async function aprovarAvaliacao(id) {

    const botoes = document.querySelectorAll(
        ".btn-aprovar-avaliacao"
    );

    botoes.forEach(botao => {
        botao.disabled = true;
    });

    try {

        const resposta = await fetch(
            `${API_BASE_URL}/avaliacoes/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        "Basic " +
                        sessionStorage.getItem(
                            "limpando7_auth"
                        ),

                    "Content-Type":
                        "text/plain"
                },

                body: "APROVADA"
            }
        );

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível aprovar a avaliação."
            );

        }

        console.log(
            "Avaliação aprovada:",
            id
        );

        alert("Avaliação aprovada com sucesso!");

        // Recarrega somente as avaliações pendentes.
        carregarAvaliacoesPendentes();

        // Recarrega somente as avaliações pendentes.
        // A avaliação aprovada desaparecerá da lista.
        carregarAvaliacoesPendentes();

    } catch (erro) {

        console.error(
            "Erro ao aprovar avaliação:",
            erro
        );

    }

}

// =====================================================
// REJEITAR AVALIAÇÃO
// =====================================================
//
// Esta função altera somente o status da avaliação.
//
// Fluxo:
// PENDENTE → REJEITADA
//
// Depois de rejeitada, ela deixa de aparecer na lista
// porque o Dashboard busca somente avaliações PENDENTES.
// =====================================================

async function rejeitarAvaliacao(id) {

    try {

        const resposta = await fetch(
            `${API_BASE_URL}/avaliacoes/${id}/status`,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        "Basic " +
                        sessionStorage.getItem(
                            "limpando7_auth"
                        ),

                    "Content-Type":
                        "text/plain"
                },

                body: "REJEITADA"
            }
        );

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível rejeitar a avaliação."
            );

        }

        console.log(
            "Avaliação rejeitada:",
            id
        );

        alert("Avaliação rejeitada com sucesso!");

        // Recarrega somente as avaliações pendentes.
        carregarAvaliacoesPendentes();



    } catch (erro) {

        console.error(
            "Erro ao rejeitar avaliação:",
            erro
        );

    }

}
// =====================================================
// CLIQUE — APROVAR AVALIAÇÃO
// =====================================================
//
// Captura o clique somente nos botões Aprovar.
//
// Não interfere nos pedidos.
// Não interfere no botão Rejeitar.
// =====================================================

document.addEventListener("click", (evento) => {

    const botao =
        evento.target.closest(
            ".btn-aprovar-avaliacao"
        );

    if (!botao) {
        return;
    }

    const avaliacaoId =
        botao.dataset.avaliacaoId;

    if (!avaliacaoId) {

        console.error(
            "ID da avaliação não encontrado."
        );

        return;
    }

    aprovarAvaliacao(avaliacaoId);

});

// =====================================================
// CLIQUE — REJEITAR AVALIAÇÃO
// =====================================================
//
// Captura o clique somente nos botões Rejeitar.
//
// Não interfere nos pedidos.
// Não interfere no botão Aprovar.
// =====================================================

document.addEventListener("click", (evento) => {

    const botao =
        evento.target.closest(
            ".btn-rejeitar-avaliacao"
        );

    if (!botao) {
        return;
    }

    const avaliacaoId =
        botao.dataset.avaliacaoId;

    if (!avaliacaoId) {

        console.error(
            "ID da avaliação não encontrado."
        );

        return;
    }

    rejeitarAvaliacao(avaliacaoId);

});


document.addEventListener("click", function (evento) {

    const botao = evento.target.closest(
        ".btn-excluir-avaliacao"
    );

    if (!botao) {
        return;
    }

    const avaliacaoId = botao.dataset.avaliacaoId;

    if (!avaliacaoId) {
        console.error("ID da avaliação não encontrado.");
        return;
    }

    excluirAvaliacao(avaliacaoId);

});


// =====================================================
// NORMALIZAR STATUS
// =====================================================

function normalizarStatus(status) {

    if (!status || status.trim() === "") {
        return "Novo";
    }

    return status;

}


// =====================================================
// CLASSE DO STATUS
// =====================================================

function obterClasseStatus(status) {

    switch (status) {

        case "Novo":
            return "status-new";

        case "Contactado":
            return "status-contacted";

        case "Agendado":
            return "status-scheduled";

        case "Concluído":
            return "status-completed";

        default:
            return "status-new";

    }

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =====================================================
// ABRIR DETALHES DO PEDIDO
// =====================================================

document.addEventListener("click", (evento) => {

    const botao =
        evento.target.closest(".table-action");

    if (!botao) {
        return;
    }

    const pedidoId =
        botao.dataset.pedidoId;

    const pedido =
        pedidosDashboard.find(
            item =>
                String(item.id) === String(pedidoId)
        );

    if (!pedido) {

        console.error(
            "Pedido não encontrado:",
            pedidoId
        );

        return;
    }


    const modal =
        document.getElementById("pedidoModal");

    const modalBody =
        document.getElementById("pedidoModalBody");

    if (!modal || !modalBody) {
        return;
    }


    const status =
        normalizarStatus(pedido.status);


    modalBody.innerHTML = `

        <div class="pedido-detalhes">

            <p>
                <strong>ID:</strong>
                ${pedido.id || "-"}
            </p>

            <p>
                <strong>Nome:</strong>
                ${pedido.nome || "-"}
            </p>

            <p>
                <strong>Telefone:</strong>
                ${pedido.telefone || "-"}
            </p>

            <p>
                <strong>E-mail:</strong>
                ${pedido.email || "-"}
            </p>

            <p>
                <strong>Serviço:</strong>
                ${pedido.servico || "-"}
            </p>

            <p>
                <strong>Data:</strong>
                ${formatarData(pedido.data)}
            </p>

            <p>
                <strong>Horário:</strong>
                ${pedido.horario || "-"}
            </p>

            <p>
                <strong>Observações:</strong>
                ${pedido.observacoes || "-"}
            </p>

            <div class="pedido-status-editor">

                <strong>Estado:</strong>

                <select id="pedidoStatusSelect">

                    <option value="Novo"
                        ${status === "Novo" ? "selected" : ""}>
                        Novo
                    </option>

                    <option value="Contactado"
                        ${status === "Contactado" ? "selected" : ""}>
                        Contactado
                    </option>

                    <option value="Agendado"
                        ${status === "Agendado" ? "selected" : ""}>
                        Agendado
                    </option>

                    <option value="Concluído"
                        ${status === "Concluído" ? "selected" : ""}>
                        Concluído
                    </option>

                </select>

                <button
                    type="button"
                    id="salvarStatusPedido"
                    data-pedido-id="${pedido.id}"
                >
                    Salvar estado
                </button>

                ${normalizarStatus(pedido.status) === "Concluído"
            ? `
            <button
                type="button"
                id="gerarLinkAvaliacao"
                data-pedido-id="${pedido.id}"
            >
                Gerar link de avaliação
            </button>
        `
            : ""
        }

            </div>

        </div>

    `;


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

});

// =====================================================
// GERAR LINK DE AVALIAÇÃO
// =====================================================
//
// Este botão só existe para pedidos concluídos.
// O Dashboard solicita ao backend o link de avaliação.
// Depois o link é copiado para a área de transferência.
// =====================================================

document.addEventListener("click", async (evento) => {

    const botao =
        evento.target.closest("#gerarLinkAvaliacao");

    // Se o clique não foi no botão,
    // não fazemos absolutamente nada.
    if (!botao) {
        return;
    }

    const pedidoId =
        botao.dataset.pedidoId;

    // Segurança: precisamos do ID do pedido.
    if (!pedidoId) {
        console.error(
            "ID do pedido não encontrado."
        );
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/${pedidoId}/link-avaliacao`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Basic " +
                        sessionStorage.getItem(
                            "limpando7_auth"
                        )
                }
            }
        );

        // O backend pode retornar 404,
        // por exemplo, se o pedido não possuir
        // um token de avaliação.
        if (!resposta.ok) {

            throw new Error(
                "Não foi possível gerar o link de avaliação."
            );
        }

        // O backend devolve:
        // ?avaliacao=TOKEN
        const caminho =
            await resposta.text();

        // Monta o endereço completo da página pública.
        const link =
            `${window.location.origin}/index.html${caminho}`;

        console.log(
            "Link de avaliação:",
            link
        );

        // Copia o link para o computador.
        await navigator.clipboard.writeText(
            link
        );

        alert(
            "Link de avaliação copiado!"
        );

    } catch (erro) {

        console.error(
            "Erro ao gerar link de avaliação:",
            erro
        );

        alert(
            "Não foi possível gerar o link de avaliação."
        );
    }

});


// =====================================================
// SALVAR STATUS
// =====================================================

document.addEventListener("click", async (evento) => {

    const botao =
        evento.target.closest("#salvarStatusPedido");

    if (!botao) {
        return;
    }

    const pedidoId =
        botao.dataset.pedidoId;

    const seletor =
        document.getElementById(
            "pedidoStatusSelect"
        );

    if (!seletor) {
        return;
    }

    const novoStatus =
        seletor.value;


    try {

        const resposta =
            await fetch(
                `${API_URL}/${pedidoId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "text/plain",
                        "Authorization": "Basic " + sessionStorage.getItem("limpando7_auth")
                    },

                    body: novoStatus
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível atualizar o status."
            );

        }


        const pedidoAtualizado =
            await resposta.json();

        console.log(
            "Status atualizado:",
            pedidoAtualizado
        );


        await carregarPedidos();

        fecharPedidoModal();


    } catch (erro) {

        console.error(
            "Erro ao atualizar status:",
            erro
        );

    }

});


// =====================================================
// FECHAR MODAL
// =====================================================

function fecharPedidoModal() {

    const modal =
        document.getElementById("pedidoModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}

// =====================================================
// LOGOUT
// =====================================================

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        sessionStorage.removeItem("limpando7_auth");
        window.location.href = "login.html";
    });
}

// =====================================================
// MOSTRAR / OCULTAR TABELA DE PEDIDOS
// =====================================================

const btnTogglePedidos =
    document.getElementById("btnTogglePedidos");

const pedidosTabelaContainer =
    document.getElementById("pedidosTabelaContainer");


if (
    btnTogglePedidos &&
    pedidosTabelaContainer
) {

    btnTogglePedidos.addEventListener(
        "click",
        () => {

            const oculto =
                pedidosTabelaContainer.classList.toggle(
                    "is-hidden"
                );

            btnTogglePedidos.textContent =
                oculto
                    ? "+ Mostrar"
                    : "− Ocultar";

            btnTogglePedidos.setAttribute(
                "aria-expanded",
                String(!oculto)
            );

        }
    );

}

// =====================================================
// MOSTRAR / OCULTAR AVALIAÇÕES
// =====================================================

const btnToggleAvaliacoes =
    document.getElementById("btnToggleAvaliacoes");

const avaliacoesContainer =
    document.getElementById("avaliacoesContainer");


if (
    btnToggleAvaliacoes &&
    avaliacoesContainer
) {

    btnToggleAvaliacoes.addEventListener(
        "click",
        () => {

            const oculto =
                avaliacoesContainer.classList.toggle(
                    "is-hidden"
                );

            btnToggleAvaliacoes.textContent =
                oculto
                    ? "+ Mostrar"
                    : "− Ocultar";

            btnToggleAvaliacoes.setAttribute(
                "aria-expanded",
                String(!oculto)
            );

        }
    );

}

// MOSTRAR / OCULTAR AVALIAÇÕES APROVADAS
const btnToggleAvaliacoesAprovadas =
    document.getElementById("btnToggleAvaliacoesAprovadas");

const avaliacoesAprovadasContainer =
    document.getElementById("avaliacoesAprovadasContainer");

if (btnToggleAvaliacoesAprovadas && avaliacoesAprovadasContainer) {
    btnToggleAvaliacoesAprovadas.addEventListener("click", () => {
        const oculto =
            avaliacoesAprovadasContainer.classList.toggle("is-hidden");

        btnToggleAvaliacoesAprovadas.textContent =
            oculto ? "+ Mostrar" : "− Ocultar";

        btnToggleAvaliacoesAprovadas.setAttribute(
            "aria-expanded",
            String(!oculto)
        );
    });
}
