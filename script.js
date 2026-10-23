/* =========================================================
   LIMPANDO7
   JAVASCRIPT PRINCIPAL
   =========================================================

   Este arquivo controla os comportamentos interactivos
   do site Limpando7.

   ORGANIZAÇÃO:

   01. Inicialização
   02. Termos e segurança
   03. Menu mobile
   04. Comparador Antes e Depois
   05. Protecção dos acessos ao WhatsApp
   06. Formulário de orçamento
   07. Mensagens do formulário
   08. Ano automático do rodapé

   PRINCÍPIO DO PROJECTO:

   Cada funcionalidade possui a sua própria função.

   Assim conseguimos fazer alterações pequenas,
   sem quebrar outras partes do site.
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES GERAIS
   ========================================================= */

/*
   Número oficial do WhatsApp da Limpando7.

   ATENÇÃO:

   O número deve estar no formato internacional.

   Exemplo:

   351912345678

   NÃO utilizar:

   +
   espaços
   parênteses
   hífens
*/

const WHATSAPP_NUMBER = "351914308807";

/*
   Endereço local do backend Spring Boot.

   Histórico do projecto confirma o endpoint POST /pedidos
   na porta 8080.
*/
const API_BASE_URL =
    window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
        ? "http://localhost:8080"
        : "https://limpando7-backend-production.up.railway.app";

/*
   Chave utilizada para guardar a aceitação
   dos termos no navegador.
*/

const TERMS_STORAGE_KEY =
    "limpando7_terms_accepted";


/* =========================================================
   01. INICIALIZAÇÃO
   ========================================================= */

/*
   Esperamos o HTML terminar de carregar.

   Só depois inicializamos os módulos.

   Cada módulo fica separado para que uma microcirurgia
   futura possa ser feita sem interferir nas outras partes.
*/

// =========================================================
// BUSCAR AVALIAÇÕES APROVADAS
// =========================================================
//
// Busca no backend somente as avaliações que o administrador
// aprovou.
// =========================================================

// =========================================================
// BUSCAR E EXIBIR AVALIAÇÕES APROVADAS
// =========================================================
//
// Busca no backend somente as avaliações aprovadas
// pelo administrador e exibe essas avaliações
// na seção pública do site.
// =========================================================

async function carregarAvaliacoesAprovadas() {

    try {

        // =====================================================
        // BUSCAR AVALIAÇÕES APROVADAS NO BACKEND
        // =====================================================
        const resposta = await fetch(
            `${API_BASE_URL}/avaliacoes/aprovadas`
        );


        // =====================================================
        // VERIFICAR RESPOSTA
        // =====================================================

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as avaliações aprovadas."
            );

        }


        // =====================================================
        // CONVERTER RESPOSTA PARA JSON
        // =====================================================

        const avaliacoes =
            await resposta.json();


        console.log(
            "Avaliações aprovadas:",
            avaliacoes
        );


        // =====================================================
        // LOCALIZAR O CONTAINER NO SITE
        // =====================================================

        const container =
            document.querySelector(
                ".testimonials-grid"
            );


        console.log(
            "CONTAINER DAS AVALIAÇÕES:",
            container
        );


        // =====================================================
        // GARANTIR QUE O CONTAINER EXISTE
        // =====================================================

        if (!container) {

            console.error(
                "Container de avaliações públicas não encontrado."
            );

            return;
        }


        // =====================================================
        // LIMPAR OS CARDS EXISTENTES
        // =====================================================

        container.innerHTML = "";


        // =====================================================
        // CASO NÃO EXISTAM AVALIAÇÕES APROVADAS
        // =====================================================

        if (avaliacoes.length === 0) {

            const mensagem =
                document.createElement("p");

            mensagem.textContent =
                "Ainda não existem avaliações aprovadas.";

            container.appendChild(
                mensagem
            );

            return;
        }


        // =====================================================
        // CRIAR OS CARDS
        // =====================================================

        avaliacoes.slice(0, 3).forEach(

            (avaliacao) => {

                // -------------------------------------------------
                // CARD
                // -------------------------------------------------

                const card =
                    document.createElement("article");

                card.className =
                    "testimonial-card";


                // -------------------------------------------------
                // FOTO
                // -------------------------------------------------

                if (avaliacao.foto) {

                    const imagem = document.createElement("img");

                    imagem.className = "testimonial-avatar";
                    imagem.alt = `Foto de ${avaliacao.nome || "cliente"}`;

                    imagem.src = avaliacao.foto
                        ? `${API_BASE_URL}/uploads/${encodeURIComponent(avaliacao.foto)}`
                        : "assets/avatar-padrao.png";

                    imagem.onerror = () => {
                        imagem.onerror = null;
                        imagem.src = "assets/avatar-padrao.png";
                    };

                    card.appendChild(imagem);
                }


                // -------------------------------------------------
                // ESTRELAS
                // -------------------------------------------------

                const estrelas =
                    document.createElement("div");

                estrelas.className =
                    "testimonial-stars";

                const nota =
                    Math.min(
                        5,
                        Math.max(
                            0,
                            Number(avaliacao.nota) || 0
                        )
                    );

                estrelas.textContent =
                    "★".repeat(nota) +
                    "☆".repeat(5 - nota);

                card.appendChild(
                    estrelas
                );


                // -------------------------------------------------
                // COMENTÁRIO
                // -------------------------------------------------

                const comentario =
                    document.createElement("p");

                comentario.textContent =
                    avaliacao.comentario || "-";

                card.appendChild(
                    comentario
                );


                // -------------------------------------------------
                // NOME
                // -------------------------------------------------

                const nome =
                    document.createElement("strong");

                nome.textContent =
                    avaliacao.nome || "Cliente";

                card.appendChild(
                    nome
                );


                // -------------------------------------------------
                // ADICIONAR CARD AO SITE
                // -------------------------------------------------

                container.appendChild(
                    card
                );

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar avaliações aprovadas:",
            erro
        );

    }

}
document.addEventListener("DOMContentLoaded", () => {

    /*
       01. Termos e segurança
    */

    initTermsModal();


    /*
       02. Menu mobile
    */

    initMobileMenu();


    /*
       03. Comparador Antes e Depois
    */

    initComparison();


    /*
       04. Formulário de orçamento
    */

    initQuoteForm();


    /*
       05. Protecção dos acessos ao WhatsApp
    */

    initWhatsAppProtection();


    /*
       06. Formulário de avaliação
    */

    initTestimonialForm();


    /*
       07. Ano automático do rodapé
    */

    initFooterYear();

    /*
       08. Ano automático do rodapé
    */

    carregarAvaliacoesAprovadas();

    /*
       09. Inicializar mapa de atuação
    */
    initMapaAtuacao();

});


/* =========================================================
   02. TERMOS E SEGURANÇA
   ========================================================= */

/*
   Controla o aviso inicial apresentado ao visitante.

   O visitante pode:

   - ler os termos;
   - aceitar e continuar.

   A aceitação fica guardada no navegador.

   IMPORTANTE:

   Esta função não depende do formulário.

   Isso mantém cada responsabilidade isolada.
*/

function initTermsModal() {


    const TERMS_PROMPT_DELAY = 1 * 60 * 1000;


    /*
       Procuro o modal através do ID existente
       no HTML.
    */

    const modal =
        document.getElementById("termsModal");


    /*
       Procuro o botão:

       "Aceitar e continuar"
    */

    const acceptButton =
        document.getElementById("acceptTermsBtn");


    /*
       Se o modal não existir no HTML,
       esta funcionalidade não precisa executar.

       Isso evita erro no console.
    */

    if (!modal) {
        return;
    }


    /*
       Verifico se o visitante já aceitou
       os termos anteriormente.
    */

    const termsAccepted =
        localStorage.getItem(
            TERMS_STORAGE_KEY
        );


    /*
       Se já aceitou anteriormente,
       escondemos o modal.

       Não apagamos a informação.
    */

    if (termsAccepted === "true") {

        modal.classList.add("is-hidden");

    }

    /* -----------------------------------------------------
   MOSTRAR O MODAL DE TERMOS APÓS 1 MINUTO
   ----------------------------------------------------- */

    if (termsAccepted !== "true") {

        setTimeout(() => {

            modal.classList.remove("is-hidden");

        }, TERMS_PROMPT_DELAY);

    }





    /* -----------------------------------------------------
       ACEITAR E CONTINUAR
       ----------------------------------------------------- */

    if (acceptButton) {

        acceptButton.addEventListener(
            "click",
            () => {

                /*
                   Guardamos a aceitação
                   no navegador.
                */

                localStorage.setItem(
                    TERMS_STORAGE_KEY,
                    "true"
                );

                /*
                   Escondemos o modal utilizando
                   a classe prevista no CSS.
                */

                modal.classList.add(
                    "is-hidden"
                );


                /*
                   Depois da aceitação,
                   tentamos devolver o foco
                   ao conteúdo principal.

                   Isto é uma melhoria de
                   acessibilidade.
                */

                const mainContent =
                    document.querySelector("main");


                if (mainContent) {

                    mainContent.setAttribute(
                        "tabindex",
                        "-1"
                    );


                    mainContent.focus();

                }

            }
        );

    }




}


/* =========================================================
   03. MENU MOBILE
   ========================================================= */

/*
   Controla o botão hamburger do telemóvel.

   O CSS continua responsável pela aparência.

   O JavaScript controla apenas:

   - abrir;
   - fechar;
   - aria-expanded;
   - aria-label;
   - tecla ESC.

   Não mexemos no layout através do JavaScript.
*/

function initMobileMenu() {

    /*
       Botão existente no HTML:
       id="menu-toggle"
       class="menu-toggle"
    */

    const menuButton =
        document.querySelector(
            ".menu-toggle"
        );


    /*
       Navegação existente no HTML:
       id="main-navigation"
       class="main-navigation"
    */

    const navigation =
        document.querySelector(
            ".main-navigation"
        );


    /*
       Se algum elemento não existir,
       não executamos o módulo.
    */

    if (!menuButton || !navigation) {
        return;
    }


    /* -----------------------------------------------------
       ABRIR / FECHAR MENU
       ----------------------------------------------------- */

    menuButton.addEventListener(
        "click",
        () => {

            /*
               Alternamos somente a classe
               responsável pela abertura.

               O CSS controla o visual.
            */

            const isOpen =
                navigation.classList.toggle(
                    "is-open"
                );


            /*
               Mantemos o ARIA sincronizado
               com o estado real do menu.
            */

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            /*
               Atualizamos também o texto acessível
               do botão.
            */

            menuButton.setAttribute(
                "aria-label",
                isOpen
                    ? "Fechar menu"
                    : "Abrir menu"
            );

        }
    );


    /* -----------------------------------------------------
       FECHAR AO CLICAR NUM LINK
       ----------------------------------------------------- */

    const navigationLinks =
        navigation.querySelectorAll("a");


    navigationLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    /*
                       Fecha o menu.
                    */

                    navigation.classList.remove(
                        "is-open"
                    );


                    /*
                       Mantém ARIA correcto.
                    */

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    /*
                       Volta para o estado
                       "Abrir menu".
                    */

                    menuButton.setAttribute(
                        "aria-label",
                        "Abrir menu"
                    );

                }
            );

        }
    );


    /* -----------------------------------------------------
       FECHAR COM A TECLA ESC
       ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        (event) => {

            /*
               Só tratamos a tecla ESC.

               Nenhuma outra tecla é alterada.
            */

            if (event.key !== "Escape") {
                return;
            }


            /*
               Fecha o menu.
            */

            navigation.classList.remove(
                "is-open"
            );


            /*
               Mantém o atributo ARIA sincronizado.
            */

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );


            /*
               Mantém o texto acessível correcto.
            */

            menuButton.setAttribute(
                "aria-label",
                "Abrir menu"
            );

        }
    );

}


/* =========================================================
   04. COMPARADOR ANTES E DEPOIS
   ========================================================= */

/*
   O comparador utiliza Pointer Events.

   Isso permite trabalhar tanto com:

   - rato;
   - touch;
   - caneta/stylus.

   A lógica permanece a mesma em desktop
   e dispositivos móveis.
*/

function initComparison() {

    /*
       Área principal do comparador.
    */

    const comparison =
        document.getElementById(
            "comparison"
        );


    /*
       Camada da imagem "Antes".
    */

    const beforeImage =
        document.getElementById(
            "comparison-before"
        );


    /*
       Linha vertical do comparador.
    */

    const comparisonLine =
        document.getElementById(
            "comparison-line"
        );


    /*
       Botão/controle que o utilizador arrasta.
    */

    const comparisonButton =
        document.getElementById(
            "comparison-button"
        );


    /*
       Se algum elemento essencial não existir,
       encerramos somente este módulo.

       O restante do site continua funcionando.
    */

    if (
        !comparison ||
        !beforeImage ||
        !comparisonLine ||
        !comparisonButton
    ) {
        return;
    }


    /*
       Estado interno:

       true  = utilizador está arrastando
       false = utilizador não está arrastando
    */

    let isDragging = false;


    /* -----------------------------------------------------
       MOVER COMPARADOR
       ----------------------------------------------------- */

    function updateComparison(clientX) {

        /*
           Descobrimos a posição e tamanho
           da área do comparador.
        */

        const rect =
            comparison.getBoundingClientRect();


        /*
           Calculamos a posição do ponteiro
           dentro da área.
        */

        let position =
            clientX - rect.left;


        /*
           Transformamos a posição em percentagem.
        */

        let percentage =
            (position / rect.width) * 100;


        /*
           Limitamos entre 0% e 100%.

           Isso impede que o slider ultrapasse
           os limites da imagem.
        */

        percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            );


        /*
           Ajustamos a largura da imagem "Antes".
        */

        beforeImage.style.width =
            `${percentage}%`;


        /*
           Movemos a linha.
        */

        comparisonLine.style.left =
            `${percentage}%`;


        /*
           Movemos o botão.
        */

        comparisonButton.style.left =
            `${percentage}%`;

    }


    /* -----------------------------------------------------
       INICIAR ARRASTO
       ----------------------------------------------------- */

    function startDragging(event) {

        isDragging = true;


        /*
           Capturamos o ponteiro para que o arrasto
           continue mesmo que o cursor/touch saia
           ligeiramente da área.
        */

        if (
            comparison.setPointerCapture
        ) {

            comparison.setPointerCapture(
                event.pointerId
            );

        }


        /*
           Atualizamos imediatamente
           a posição do comparador.
        */

        updateComparison(
            event.clientX
        );

    }


    /* -----------------------------------------------------
       MOVIMENTAR
       ----------------------------------------------------- */

    function moveDragging(event) {

        /*
           Só movimentamos se o utilizador
           realmente estiver arrastando.
        */

        if (!isDragging) {
            return;
        }


        updateComparison(
            event.clientX
        );

    }


    /* -----------------------------------------------------
       FINALIZAR ARRASTO
       ----------------------------------------------------- */

    function stopDragging(event) {

        isDragging = false;


        /*
           Libertamos a captura do ponteiro
           quando ela estiver activa.
        */

        if (
            event.pointerId !== undefined &&
            comparison.hasPointerCapture &&
            comparison.hasPointerCapture(
                event.pointerId
            )
        ) {

            comparison.releasePointerCapture(
                event.pointerId
            );

        }

    }


    /* -----------------------------------------------------
       EVENTOS
       ----------------------------------------------------- */

    comparison.addEventListener(
        "pointerdown",
        startDragging
    );


    comparison.addEventListener(
        "pointermove",
        moveDragging
    );


    comparison.addEventListener(
        "pointerup",
        stopDragging
    );


    comparison.addEventListener(
        "pointercancel",
        stopDragging
    );


    comparison.addEventListener(
        "pointerleave",
        (event) => {

            /*
               Não encerramos obrigatoriamente
               o arrasto aqui.

               O Pointer Capture permite continuar
               o movimento de forma mais estável.
            */

        }
    );


    /* -----------------------------------------------------
       ACESSIBILIDADE DO BOTÃO
       ----------------------------------------------------- */

    comparisonButton.addEventListener(
        "keydown",
        (event) => {

            /*
               Permite movimentar o comparador
               utilizando as setas do teclado.
            */

            if (
                event.key !== "ArrowLeft" &&
                event.key !== "ArrowRight"
            ) {
                return;
            }


            event.preventDefault();


            /*
               Pegamos a posição actual
               através do estilo da linha.

               Se ainda não existir,
               começamos aproximadamente no centro.
            */

            const currentLeft =
                parseFloat(
                    comparisonLine.style.left
                );


            const currentPercentage =
                Number.isFinite(currentLeft)
                    ? currentLeft
                    : 50;


            /*
               Cada toque na seta movimenta
               2% do comparador.
            */

            const step = 2;


            let newPercentage =
                event.key === "ArrowLeft"
                    ? currentPercentage - step
                    : currentPercentage + step;


            /*
               Novamente garantimos os limites.
            */

            newPercentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        newPercentage
                    )
                );


            /*
               Aplicamos a nova posição.
            */

            beforeImage.style.width =
                `${newPercentage}%`;


            comparisonLine.style.left =
                `${newPercentage}%`;


            comparisonButton.style.left =
                `${newPercentage}%`;

        }
    );

}

/* =========================================================
   05. PROTECÇÃO DOS ACESSOS AO WHATSAPP
   ========================================================= */

/*
   O objectivo desta função é garantir que os links
   de WhatsApp existentes no site respeitem o estado
   de aceitação dos termos.

   IMPORTANTE:

   Não alteramos o HTML.

   Apenas interceptamos o clique quando necessário.
*/

function initWhatsAppProtection() {

    /*
       Procura todos os links que apontam directamente
       para o WhatsApp.
    */

    const whatsappLinks =
        document.querySelectorAll(
            'a[href*="wa.me"], a[href*="whatsapp.com"]'
        );


    /*
       Se não houver nenhum link,
       não há nada para proteger.
    */

    if (!whatsappLinks.length) {
        return;
    }


    /*
       Aplicamos a protecção individualmente.
    */

    whatsappLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    /*
                       Verificamos se os termos
                       já foram aceites.
                    */

                    if (areTermsAccepted()) {
                        return;
                    }


                    /*
                       Impedimos a abertura do WhatsApp
                       enquanto os termos não forem aceites.
                    */

                    event.preventDefault();


                    /*
                       Procuramos o modal.
                    */

                    const modal =
                        document.getElementById(
                            "termsModal"
                        );


                    /*
                       Se o modal existir,
                       mostramos novamente.
                    */

                    if (modal) {

                        modal.classList.remove(
                            "is-hidden"
                        );


                        /*
                           Colocamos o foco no botão
                           de aceitação quando possível.
                        */

                        const acceptButton =
                            document.getElementById(
                                "acceptTermsBtn"
                            );


                        if (acceptButton) {

                            acceptButton.focus();

                        }

                    }

                }
            );

        }
    );

}


/* =========================================================
   05.1 VERIFICAR ACEITAÇÃO DOS TERMOS
   ========================================================= */

/*
   Esta função centraliza a verificação.

   Em vez de cada parte do sistema consultar
   localStorage de maneira diferente,
   todas utilizam esta mesma função.

   Isso evita inconsistências.
*/

function areTermsAccepted() {

    return (
        localStorage.getItem(
            TERMS_STORAGE_KEY
        ) === "true"
    );

}


/* =========================================================
   06. FORMULÁRIO DE ORÇAMENTO
   ========================================================= */

/*
   Controla o formulário principal do site.

   Campos utilizados pelo HTML actual:

   - nome
   - telefone
   - email
   - servico
   - data
   - horario
   - mensagem

   O formulário NÃO envia directamente para um
   endereço externo nesta etapa.

   Primeiro validamos os dados.

   Depois construímos a mensagem.

   Finalmente encaminhamos o cliente para o WhatsApp.
*/

function initQuoteForm() {

    /*
       Procuramos o formulário através da classe
       utilizada no HTML.
    */

    const form =
        document.querySelector(
            ".quote-form"
        );


    /*
       Se o formulário não existir,
       não executamos este módulo.
    */

    if (!form) {
        return;
    }

    // Inicializa a validação internacional do telefone.
    const telefoneInput = document.getElementById("telefone");

    const telefoneIntl = telefoneInput && window.intlTelInput
        ? window.intlTelInput(telefoneInput, {
            initialCountry: "pt",
            preferredCountries: ["pt", "br"],
            separateDialCode: true,
            nationalMode: true,
            loadUtils: () => import(
                "https://cdn.jsdelivr.net/npm/intl-tel-input@25.10.1/build/js/utils.js"
            )
        })
        : null;

    /*
       Capturamos a área onde as mensagens
       de erro ou sucesso serão apresentadas.
    */

    const formMessage =
        document.getElementById(
            "form-message"
        );


    /*
       Evento principal de envio.
    */

    form.addEventListener(
        "submit",
        async (event) => {

            /*
               Impedimos o envio tradicional
               da página.

               O processamento será feito pelo JavaScript.
            */

            event.preventDefault();


            /* -------------------------------------------------
               PRIMEIRA PROTECÇÃO:
               TERMOS
               ------------------------------------------------- */

            /*
               O cliente precisa aceitar os termos
               antes de continuar.
            */

            if (!areTermsAccepted()) {

                /*
                   Mostramos o modal novamente.
                */

                const modal =
                    document.getElementById(
                        "termsModal"
                    );


                if (modal) {

                    modal.classList.remove(
                        "is-hidden"
                    );

                }


                /*
                   Também informamos o utilizador.
                */

                showFormMessage(
                    formMessage,
                    "Antes de enviar o pedido, aceite os termos e condições.",
                    "error"
                );


                /*
                   Interrompemos aqui.

                   Nenhum dado é enviado.
                */

                return;

            }


            /* -------------------------------------------------
               SEGUNDA PROTECÇÃO:
               VALIDAÇÃO
               ------------------------------------------------- */

            // Valida o telefone antes de permitir o envio.
            if (
                !telefoneIntl ||
                !telefoneIntl.isValidNumber() ||
                !telefoneIntl.getNumber() ||
                telefoneInput.value.trim().startsWith("+")
            ) {
                showFormMessage(
                    formMessage,
                    "Por favor, selecione o país e introduza um número de telefone válido.",
                    "error"
                );

                telefoneInput.focus();
                return;
            }

            // Impede agendamentos fora do horário comercial.
            const horarioSelecionado =
                document.getElementById("horario").value;

            if (
                horarioSelecionado &&
                (horarioSelecionado < "08:00" ||
                    horarioSelecionado > "18:00")
            ) {
                showFormMessage(
                    formMessage,
                    "Por favor, selecione um horário entre 08:00 e 18:00.",
                    "error"
                );

                document.getElementById("horario").focus();
                return;
            }
            
            /*
               Validamos todos os campos antes
               de construir a mensagem.
            */



            const validation =
                validateQuoteForm(form);


            /*
               Se houver erro,
               mostramos a mensagem e paramos.
            */

            if (!validation.valid) {

                showFormMessage(
                    formMessage,
                    validation.message,
                    "error"
                );


                /*
                   Colocamos foco no primeiro campo
                   com erro quando possível.
                */

                if (validation.field) {

                    validation.field.focus();

                }


                return;

            }


            /* -------------------------------------------------
               CAPTURA DOS DADOS
               ------------------------------------------------- */

            /*
               FormData lê os campos através
               dos atributos name do HTML.

               Isto é importante:

               Não usamos apenas os IDs.

               O formulário actual possui os names:

               nome
               telefone
               email
               servico
               data
               horario
               mensagem
            */

            const formData =
                new FormData(form);


            /*
               Capturamos cada informação.
            */

            const nome =
                String(
                    formData.get("nome") || ""
                ).trim();


            // Guarda o telefone no formato internacional.
            const telefone = telefoneIntl.getNumber();


            const email =
                String(
                    formData.get("email") || ""
                ).trim();


            const servico =
                String(
                    formData.get("servico") || ""
                ).trim();


            const data =
                String(
                    formData.get("data") || ""
                ).trim();


            const horario =
                String(
                    formData.get("horario") || ""
                ).trim();


            const mensagem =
                String(
                    formData.get("mensagem") || ""
                ).trim();


            /* -------------------------------------------------
               CONSTRUIR DATA PARA WHATSAPP
               ------------------------------------------------- */

            const dataFormatada =
                formatDateForWhatsApp(data);


            /* -------------------------------------------------
               CONSTRUIR MENSAGEM
               ------------------------------------------------- */

            /*
               Mantemos uma estrutura organizada
               para facilitar a leitura pelo cliente.
            */

            const whatsappMessage =
                [
                    "Olá, Limpando7!",
                    "",
                    "Gostaria de solicitar um orçamento.",
                    "",
                    `Nome: ${nome}`,
                    `Telefone: ${telefone}`,
                    `E-mail: ${email}`,
                    `Serviço: ${servico}`,
                    `Data pretendida: ${dataFormatada}`,
                    `Horário pretendido: ${horario}`,
                    "",
                    `Mensagem: ${mensagem}`
                ].join("\n");


            /* -------------------------------------------------
               CRIAR URL DO WHATSAPP
               ------------------------------------------------- */

            const whatsappUrl =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    whatsappMessage
                )}`;


            /* -------------------------------------------------
               GUARDAR O PEDIDO NO BACKEND
               ------------------------------------------------- */

            /*
               Abrimos uma aba vazia durante o clique do utilizador.
               Assim o navegador não bloqueia o WhatsApp depois
               da resposta assíncrona do backend.
            */
            const whatsappWindow =
                window.open("about:blank", "_blank");

            try {

                const response =
                    await fetch(`${API_BASE_URL}/pedidos`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            nome,
                            telefone,
                            email,
                            servico,
                            data,
                            horario,
                            observacoes: mensagem
                        })
                    });

                if (!response.ok) {
                    throw new Error(
                        `POST /pedidos respondeu HTTP ${response.status}`
                    );
                }

            } catch (error) {

                if (whatsappWindow && !whatsappWindow.closed) {
                    whatsappWindow.close();
                }

                console.error(
                    "Não foi possível guardar o pedido no backend:",
                    error
                );

                showFormMessage(
                    formMessage,
                    "Não foi possível guardar o pedido. Verifique se o servidor está ligado e tente novamente.",
                    "error"
                );

                return;

            }


            /* -------------------------------------------------
               FEEDBACK AO UTILIZADOR
               ------------------------------------------------- */

            showFormMessage(
                formMessage,
                "Pedido guardado. A abrir o WhatsApp...",
                "success"
            );

            const agendamentoAlert =
                document.querySelector(".agendamento-alert");

            if (agendamentoAlert) {
                agendamentoAlert.style.display = "flex";

                setTimeout(() => {
                    agendamentoAlert.style.display = "none";
                }, 15000);
            }

            setTimeout(() => {
                formMessage.textContent = "";
                formMessage.classList.remove(
                    "is-success",
                    "is-error"
                );
            }, 5000);


            /* -------------------------------------------------
               ABRIR WHATSAPP
               ------------------------------------------------- */

            /*
               Pequeno atraso apenas para permitir que
               a mensagem de sucesso seja percebida.
            */

            if (whatsappWindow) {
                whatsappWindow.location.href = whatsappUrl;
            } else {
                showFormMessage(
                    formMessage,
                    "Pedido guardado, mas o navegador bloqueou a nova janela do WhatsApp.",
                    "success"
                );
            }

        }
    );

}


/* =========================================================
   06.1 VALIDAÇÃO DO FORMULÁRIO
   ========================================================= */

/*
   Esta função valida os dados antes de qualquer
   tentativa de envio.

   Retorna sempre um objecto:

   {
       valid: true/false,
       message: "...",
       field: elemento
   }

   Assim o submit sabe exactamente o que fazer.
*/

function validateQuoteForm(form) {

    /*
       Capturamos os campos pelos IDs existentes
       no HTML actual.
    */

    const nome =
        document.getElementById("nome");


    const telefone =
        document.getElementById("telefone");


    const email =
        document.getElementById("email");


    const servico =
        document.getElementById("servico");


    const data =
        document.getElementById("data");


    const horario =
        document.getElementById("horario");


    const mensagem =
        document.getElementById("mensagem");


    /* -----------------------------------------------------
       NOME
       ----------------------------------------------------- */

    if (
        !nome ||
        nome.value.trim().length < 2
    ) {

        return {
            valid: false,
            message:
                "Por favor, informe o seu nome.",
            field: nome
        };

    }


    /* -----------------------------------------------------
       TELEFONE
       ----------------------------------------------------- */

    if (
        !telefone ||
        telefone.value.trim().length < 7
    ) {

        return {
            valid: false,
            message:
                "Por favor, informe um telefone válido.",
            field: telefone
        };

    }


    /* -----------------------------------------------------
       E-MAIL
       ----------------------------------------------------- */

    if (email) {

        const emailValue =
            email.value.trim();


        /*
           Se o campo estiver preenchido,
           validamos o formato.

           Não obrigamos um e-mail que o HTML
           não tenha marcado como required.
        */

        if (emailValue !== "") {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    emailValue
                )
            ) {

                return {
                    valid: false,
                    message:
                        "Por favor, informe um e-mail válido.",
                    field: email
                };

            }

        }

    }


    /* -----------------------------------------------------
       SERVIÇO
       ----------------------------------------------------- */

    if (
        !servico ||
        servico.value.trim() === ""
    ) {

        return {
            valid: false,
            message:
                "Seleccione o serviço pretendido.",
            field: servico
        };

    }


    /* -----------------------------------------------------
       DATA
       ----------------------------------------------------- */

    if (
        !data ||
        data.value.trim() === ""
    ) {

        return {
            valid: false,
            message:
                "Seleccione uma data pretendida.",
            field: data
        };

    }


    /* -----------------------------------------------------
       HORÁRIO
       ----------------------------------------------------- */

    if (
        !horario ||
        horario.value.trim() === ""
    ) {

        return {
            valid: false,
            message:
                "Seleccione o horário pretendido.",
            field: horario
        };

    }




    /* -----------------------------------------------------
       FORMULÁRIO VÁLIDO
       ----------------------------------------------------- */

    return {
        valid: true,
        message: "",
        field: null
    };

}


/* =========================================================
   06.2 FORMATAR DATA
   ========================================================= */

/*
   O input type="date" normalmente entrega:

   YYYY-MM-DD

   Para o WhatsApp queremos:

   DD/MM/YYYY
*/

function formatDateForWhatsApp(
    dateValue
) {

    /*
       Se não houver data,
       retornamos um texto neutro.
    */

    if (!dateValue) {
        return "Não informada";
    }


    /*
       Dividimos a data.
    */

    const parts =
        dateValue.split("-");


    /*
       Confirmamos se recebemos
       o formato esperado.
    */

    if (parts.length !== 3) {
        return dateValue;
    }


    const year = parts[0];

    const month = parts[1];

    const day = parts[2];


    /*
       Retornamos no padrão português.
    */

    return `${day}/${month}/${year}`;

}


/* =========================================================
   07. MENSAGEM DO FORMULÁRIO
   ========================================================= */

/*
   Mostra mensagens de:

   - erro
   - sucesso

   Sem depender de alert() do navegador.

   Isso permite manter o visual dentro
   do próprio formulário.
*/

function showFormMessage(
    element,
    message,
    type
) {

    /*
       Se o elemento não existir,
       não geramos erro.

       Apenas terminamos.
    */

    if (!element) {
        return;
    }


    /*
       Limpamos classes anteriores.
    */

    element.classList.remove(
        "is-error",
        "is-success"
    );


    /*
       Definimos o texto.
    */

    element.textContent =
        message;


    /*
       Aplicamos a classe correspondente.
    */

    if (type === "error") {

        element.classList.add(
            "is-error"
        );

    }


    if (type === "success") {

        element.classList.add(
            "is-success"
        );

    }


    /*
       Mantemos a área acessível
       para leitores de ecrã.
    */

    element.setAttribute(
        "role",
        "alert"
    );

}

/* =========================================================
   08. ACESSIBILIDADE E PROTECÇÕES AUXILIARES
   ========================================================= */

/*
   Esta parte reúne pequenos comportamentos que não pertencem
   directamente ao formulário, ao menu ou ao comparador.

   A regra aqui é simples:

   - não alterar o conteúdo visual;
   - não criar elementos desnecessários;
   - não interferir no CSS;
   - melhorar apenas o comportamento quando necessário.
*/


/* =========================================================
   08.1 PROTECÇÃO DOS LINKS DE WHATSAPP
   ========================================================= */

/*
   Alguns links podem ser adicionados futuramente ao site.

   Esta função garante que qualquer link directo para
   WhatsApp passe pela mesma regra dos termos.

   A função é separada de initWhatsAppProtection()
   para manter a verificação centralizada.
*/

function checkWhatsAppAccess(event) {

    /*
       Se os termos já foram aceites,
       o comportamento normal do link continua.
    */

    if (areTermsAccepted()) {
        return true;
    }


    /*
       Caso contrário, impedimos a navegação.
    */

    if (event) {
        event.preventDefault();
    }


    /*
       Procuramos o modal.
    */

    const modal =
        document.getElementById(
            "termsModal"
        );


    /*
       Abrimos o modal novamente.
    */

    if (modal) {

        modal.classList.remove(
            "is-hidden"
        );

    }


    /*
       Colocamos o foco no botão de aceitação
       quando ele existir.
    */

    const acceptButton =
        document.getElementById(
            "acceptTermsBtn"
        );


    if (acceptButton) {

        acceptButton.focus();

    }


    /*
       Informamos ao chamador que o acesso
       não foi permitido.
    */

    return false;

}


/* =========================================================
   08.2 LIMPAR FORMULÁRIO
   ========================================================= */

/*
   Esta função fica disponível para utilização
   futura pelo projecto.

   Não é executada automaticamente após o envio.

   Isso é intencional.

   O utilizador pode precisar consultar os dados
   preenchidos depois de abrir o WhatsApp.
*/

function clearQuoteForm(form) {

    /*
       Se não recebermos um formulário,
       não fazemos nada.
    */

    if (!form) {
        return;
    }


    /*
       Utilizamos o método nativo reset()
       para devolver os campos ao estado original
       definido pelo HTML.
    */

    form.reset();


    /*
       Procuramos a área de mensagens.
    */

    const formMessage =
        document.getElementById(
            "form-message"
        );


    /*
       Limpamos qualquer mensagem anterior.
    */

    if (formMessage) {

        formMessage.textContent = "";


        formMessage.classList.remove(
            "is-error",
            "is-success"
        );


        formMessage.removeAttribute(
            "role"
        );

    }

}


/* =========================================================
   08.3 PROTECÇÃO CONTRA DUPLO ENVIO
   ========================================================= */

/*
   Evita que o utilizador clique repetidamente
   no botão enquanto o JavaScript está processando
   o formulário.

   Esta função trabalha somente durante o envio.
*/

function setQuoteFormSubmitting(
    form,
    isSubmitting
) {

    /*
       Se o formulário não existir,
       não fazemos nada.
    */

    if (!form) {
        return;
    }


    /*
       Procuramos o botão de envio
       dentro do próprio formulário.

       Assim não alteramos outros botões
       existentes na página.
    */

    const submitButton =
        form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );


    /*
       Se não houver botão,
       terminamos.
    */

    if (!submitButton) {
        return;
    }


    /*
       Guardamos o estado original
       apenas na primeira execução.
    */

    if (
        !submitButton.dataset.originalText &&
        "value" in submitButton
    ) {

        submitButton.dataset.originalText =
            submitButton.value;

    }


    if (
        !submitButton.dataset.originalText &&
        !("value" in submitButton)
    ) {

        submitButton.dataset.originalText =
            submitButton.textContent;

    }


    /*
       Bloqueamos ou libertamos o botão.
    */

    submitButton.disabled =
        isSubmitting;


    /*
       Se estiver enviando,
       mostramos um estado visual simples.
    */

    if (isSubmitting) {

        if ("value" in submitButton) {

            submitButton.value =
                "A processar...";

        } else {

            submitButton.textContent =
                "A processar...";

        }

    } else {

        /*
           Restauramos o texto original.
        */

        if ("value" in submitButton) {

            submitButton.value =
                submitButton.dataset.originalText || "";

        } else {

            submitButton.textContent =
                submitButton.dataset.originalText || "";

        }

    }

}


/* =========================================================
   08.4 NAVEGAÇÃO POR ÂNCORAS
   ========================================================= */

/*
   Esta função trata apenas links internos
   que utilizem #id.

   Não mexemos em links externos.

   Não mexemos em WhatsApp.

   Não mexemos em links que não possuam destino interno.
*/

function initSmoothLinks() {

    const internalLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    if (!internalLinks.length) {
        return;
    }


    internalLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    /*
                       "#" sozinho não representa
                       uma secção real.
                    */

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    /*
                       Procuramos o elemento
                       correspondente ao ID.
                    */

                    const target =
                        document.querySelector(
                            targetId
                        );


                    /*
                       Se o destino não existir,
                       não alteramos o comportamento
                       original do navegador.

                       Isto é especialmente importante
                       para não mascarar problemas do HTML.
                    */

                    if (!target) {
                        return;
                    }


                    /*
                       Agora sim fazemos o scroll suave.
                    */

                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    /*
                       Depois do movimento,
                       colocamos foco no destino quando
                       ele puder receber foco.
                    */

                    if (
                        typeof target.focus ===
                        "function"
                    ) {

                        target.setAttribute(
                            "tabindex",
                            "-1"
                        );


                        target.focus({
                            preventScroll: true
                        });

                    }

                }
            );

        }
    );

}


/* =========================================================
   08.5 ACESSIBILIDADE DO MODAL
   ========================================================= */

/*
   Mantém o estado ARIA do modal coerente
   quando ele estiver presente.

   Não substitui a lógica de abertura/fecho
   dos termos.
*/

function initModalAccessibility() {

    const modal =
        document.getElementById(
            "termsModal"
        );


    if (!modal) {
        return;
    }


    /*
       O modal representa uma janela de diálogo.
    */

    modal.setAttribute(
        "role",
        "dialog"
    );


    /*
       Indicamos que ele é modal.
    */

    modal.setAttribute(
        "aria-modal",
        "true"
    );


    /*
       Se existir um título identificável,
       associamos o modal ao título.

       Não criamos título novo.
    */

    const modalTitle =
        modal.querySelector(
            "h1, h2, h3, .modal-title"
        );


    if (
        modalTitle &&
        !modalTitle.id
    ) {

        modalTitle.id =
            "terms-modal-title";

    }


    if (modalTitle) {

        modal.setAttribute(
            "aria-labelledby",
            modalTitle.id
        );

    }

}


/* =========================================================
   08.6 FOCO DO MODAL
   ========================================================= */

/*
   Quando o modal estiver visível,
   o botão de aceitação recebe foco.

   Esta função é pequena e independente
   para evitar duplicação da lógica.
*/

function focusTermsButton() {

    const modal =
        document.getElementById(
            "termsModal"
        );


    if (!modal) {
        return;
    }


    /*
       Modal escondido não precisa receber foco.
    */

    if (
        modal.classList.contains(
            "is-hidden"
        )
    ) {
        return;
    }


    const acceptButton =
        document.getElementById(
            "acceptTermsBtn"
        );


    if (acceptButton) {

        acceptButton.focus();

    }

}


/* =========================================================
   08.7 ESC PARA O MODAL
   ========================================================= */

/*
   ATENÇÃO:

   O modal de termos não deve ser fechado simplesmente
   com ESC antes da aceitação.

   Isso é proposital.

   O visitante precisa escolher uma das opções
   disponibilizadas pelo próprio modal.

   Portanto, aqui não adicionamos um "fechar com ESC".

   Essa ausência é intencional e faz parte da regra
   de segurança definida para o projecto.
*/


/* =========================================================
   08.8 INICIALIZAÇÃO DAS FUNÇÕES DE ACESSIBILIDADE
   ========================================================= */

/*
   Mantemos uma função própria para inicializar
   os pequenos ajustes de acessibilidade.

   Assim o bloco principal continua limpo.
*/

function initAccessibility() {

    initSmoothLinks();

    initModalAccessibility();

}

/* =========================================================
   09. PROTECÇÃO DE ALTERAÇÕES NO FORMULÁRIO
   ========================================================= */

/*
   Esta microcirurgia existe para evitar que o utilizador
   perca dados preenchidos acidentalmente.

   Só mostramos confirmação quando realmente existem
   alterações no formulário.
*/

function initFormChangeProtection() {

    const form =
        document.querySelector(
            ".quote-form"
        );


    /*
       Sem formulário, não há nada para proteger.
    */

    if (!form) {
        return;
    }


    /*
       Estado interno:

       false = formulário ainda não foi alterado
       true  = formulário possui alterações
    */

    let formChanged = false;


    /*
       Qualquer alteração em campos do formulário
       marca o formulário como alterado.
    */

    form.addEventListener(
        "input",
        () => {

            formChanged = true;

        }
    );


    form.addEventListener(
        "change",
        () => {

            formChanged = true;

        }
    );


    /*
       Quando o formulário for enviado correctamente,
       não precisamos mais avisar sobre alterações.
    */

    form.addEventListener(
        "submit",
        () => {

            /*
               O submit principal já possui
               a sua própria validação.

               Aqui apenas registamos que houve
               uma tentativa de envio.
            */

        }
    );


    /*
       Quando o utilizador tentar sair da página,
       mostramos o aviso somente se houver alterações.
    */

    window.addEventListener(
        "beforeunload",
        (event) => {

            if (!formChanged) {
                return;
            }


            /*
               A mensagem personalizada não é exibida
               pelos navegadores modernos.

               O simples retorno activa o aviso nativo.
            */

            event.preventDefault();

            event.returnValue = "";

        }
    );


    /*
       Função auxiliar para permitir que outro módulo
       possa indicar que o formulário já foi processado.
    */

    form.addEventListener(
        "reset",
        () => {

            formChanged = false;

        }
    );

}


/* =========================================================
   10. ESTADO DOS TERMOS
   ========================================================= */

/*
   Esta função existe para centralizar novamente
   a consulta do estado dos termos.

   Não utilizamos directamente localStorage
   espalhado pelo projecto.
*/

function getTermsState() {

    return {
        accepted:
            areTermsAccepted()
    };

}


/* =========================================================
   11. REABRIR TERMOS QUANDO NECESSÁRIO
   ========================================================= */

/*
   Quando alguma funcionalidade protegida precisa
   dos termos, usamos esta função.

   Assim não duplicamos a lógica do modal.
*/

function requireTermsAcceptance() {

    /*
       Se já estiver aceite,
       não precisamos fazer nada.
    */

    if (areTermsAccepted()) {
        return true;
    }


    /*
       Procuramos o modal.
    */

    const modal =
        document.getElementById(
            "termsModal"
        );


    /*
       Se o modal existir,
       tornamo-lo visível.
    */

    if (modal) {

        modal.classList.remove(
            "is-hidden"
        );

    }


    /*
       Damos foco ao botão de aceitação.
    */

    focusTermsButton();


    /*
       Informamos que a condição
       ainda não foi cumprida.
    */

    return false;

}


/* =========================================================
   12. VALIDAÇÃO DA DATA
   ========================================================= */

/*
   Além da validação HTML5,
   fazemos uma verificação simples da data.

   O objectivo é impedir uma data vazia ou inválida
   de chegar ao WhatsApp.
*/

function isValidDateValue(
    dateValue
) {

    /*
       Sem valor não existe data válida.
    */

    if (!dateValue) {
        return false;
    }


    /*
       O input type="date" utiliza normalmente
       o formato YYYY-MM-DD.
    */

    const parts =
        dateValue.split("-");


    if (parts.length !== 3) {
        return false;
    }


    const year =
        Number(parts[0]);


    const month =
        Number(parts[1]);


    const day =
        Number(parts[2]);


    /*
       Verificamos valores básicos.
    */

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return false;
    }


    if (
        month < 1 ||
        month > 12
    ) {
        return false;
    }


    if (
        day < 1 ||
        day > 31
    ) {
        return false;
    }


    /*
       Criamos a data e confirmamos
       se o navegador não corrigiu automaticamente
       um valor impossível.
    */

    const date =
        new Date(
            year,
            month - 1,
            day
        );


    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );

}


/* =========================================================
   13. VALIDAÇÃO DO TELEFONE
   ========================================================= */

/*
   Telefone pode conter:

   +351
   espaços
   parênteses
   hífens

   Por isso retiramos caracteres não numéricos
   apenas para validar a quantidade de dígitos.
*/

function isValidPhoneValue(
    phoneValue
) {

    if (!phoneValue) {
        return false;
    }


    const digits =
        phoneValue.replace(
            /\D/g,
            ""
        );


    /*
       Não permitimos números absurdamente curtos
       ou longos.
    */

    return (
        digits.length >= 7 &&
        digits.length <= 15
    );

}


/* =========================================================
   14. FORMATAÇÃO DO TELEFONE PARA WHATSAPP
   ========================================================= */

/*
   Esta função normaliza o número utilizado
   para construir a URL do WhatsApp.

   Não modifica o telefone mostrado na mensagem.
*/

function normalizePhoneForWhatsApp(
    phoneValue
) {

    if (!phoneValue) {
        return "";
    }


    /*
       Mantemos apenas números.
    */

    return phoneValue.replace(
        /\D/g,
        ""
    );

}


/* =========================================================
   15. VERIFICAÇÃO DO LINK DO WHATSAPP
   ========================================================= */

/*
   Pequena protecção contra URLs incompletas.

   O objectivo não é validar a existência do número
   no serviço WhatsApp.

   Apenas impedimos a construção de uma URL vazia.
*/

function isValidWhatsAppNumber(
    number
) {

    if (!number) {
        return false;
    }


    return (
        /^\d{7,15}$/.test(number)
    );

}


/* =========================================================
   16. CRIAR URL DO WHATSAPP
   ========================================================= */

/*
   Centralizamos a criação da URL.

   Isso evita construir links diferentes
   em diferentes partes do projecto.
*/

function buildWhatsAppUrl(
    message
) {

    /*
       Confirmamos o número configurado.
    */

    if (
        !isValidWhatsAppNumber(
            WHATSAPP_NUMBER
        )
    ) {

        return "";

    }


    /*
       Codificamos a mensagem para URL.

       Isto preserva:

       - espaços;
       - acentos;
       - quebras de linha;
       - caracteres especiais.
    */

    const encodedMessage =
        encodeURIComponent(
            message
        );


    return (
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodedMessage}`
    );

}


/* =========================================================
   17. FEEDBACK DE ERRO DO WHATSAPP
   ========================================================= */

/*
   Se por algum motivo a URL não puder ser construída,
   mostramos uma mensagem dentro do formulário.
*/

function showWhatsAppError() {

    const formMessage =
        document.getElementById(
            "form-message"
        );


    showFormMessage(
        formMessage,
        "Não foi possível preparar o contacto pelo WhatsApp. Verifique a configuração do número.",
        "error"
    );

}


/* =========================================================
   18. PROTECÇÃO DO ENVIO
   ========================================================= */

/*
   Esta função concentra as condições mínimas
   antes de abrir o WhatsApp.

   Ordem:

   1. termos;
   2. número;
   3. mensagem.
*/

function canOpenWhatsApp(
    message
) {

    /*
       Primeiro:

       termos.
    */

    if (!requireTermsAcceptance()) {
        return false;
    }


    /*
       Segundo:

       número configurado.
    */

    if (
        !isValidWhatsAppNumber(
            WHATSAPP_NUMBER
        )
    ) {

        showWhatsAppError();

        return false;

    }


    /*
       Terceiro:

       mensagem.
    */

    if (!message || !message.trim()) {

        showWhatsAppError();

        return false;

    }


    return true;

}


/* =========================================================
   19. ABRIR WHATSAPP COM SEGURANÇA
   ========================================================= */

/*
   Única função responsável pela abertura programática
   do WhatsApp a partir do formulário.
*/

function openWhatsApp(
    message
) {

    /*
       Verificamos todas as condições antes.
    */

    if (
        !canOpenWhatsApp(
            message
        )
    ) {

        return false;

    }


    /*
       Construímos a URL.
    */

    const whatsappUrl =
        buildWhatsAppUrl(
            message
        );


    /*
       Se não houver URL,
       interrompemos.
    */

    if (!whatsappUrl) {

        showWhatsAppError();

        return false;

    }


    /*
       Abrimos numa nova aba.

       "noopener,noreferrer" reduz a exposição
       da página de origem.
    */

    const newWindow =
        window.open(
            whatsappUrl,
            "_blank",
            "noopener,noreferrer"
        );


    /*
       Alguns navegadores podem bloquear pop-ups.

       Se isso acontecer, mostramos orientação
       ao utilizador.
    */

    if (!newWindow) {

        const formMessage =
            document.getElementById(
                "form-message"
            );


        showFormMessage(
            formMessage,
            "O navegador bloqueou a abertura do WhatsApp. Permita pop-ups para este site e tente novamente.",
            "error"
        );


        return false;

    }


    return true;

}

/* =========================================================
   FORMULÁRIO DE AVALIAÇÃO
   ========================================================= */

/*
   Controla apenas a abertura e o fechamento
   do formulário de avaliação.

   Nesta etapa ainda não existe envio para o backend.
*/
function initTestimonialForm() {

    const openButton =
        document.getElementById(
            "abrirFormularioAvaliacao"
        );


    const closeButton =
        document.getElementById(
            "fecharFormularioAvaliacao"
        );


    const formContainer =
        document.getElementById(
            "testimonialFormContainer"
        );


    /*
       Se algum elemento não existir,
       não fazemos nada.
    */

    if (
        !openButton ||
        !closeButton ||
        !formContainer
    ) {

        return;

    }


    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const tokenAvaliacao =
        parametros.get("avaliacao");


    /*
       Sem token:
       formulário permanece escondido.
    */

    if (!tokenAvaliacao) {

        openButton.style.display = "none";

        formContainer.classList.add(
            "is-hidden"
        );

    }


    /*
       Com token:
       formulário é aberto automaticamente.
    */

    if (tokenAvaliacao) {

        formContainer.classList.remove(
            "is-hidden"
        );

        openButton.style.display = "none";

        setTimeout(() => {

            formContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 300);

    }

    /*
   ---------------------------------------------------------
   SELEÇÃO DA CLASSIFICAÇÃO POR ESTRELAS
   ---------------------------------------------------------

   Capturamos todas as estrelas do formulário.

   Nesta etapa:
   - não enviamos nada;
   - não usamos backend;
   - apenas controlamos visualmente a classificação.
*/

    const ratingStars =
        document.querySelectorAll(
            ".rating-star"
        );

    /*
Guarda a classificação escolhida pelo cliente.

Começamos com 0 porque nenhuma estrela
foi selecionada inicialmente.
*/

    let selectedRating = 0;

    /*
   ---------------------------------------------------------
   CAMPOS DA AVALIAÇÃO
   ---------------------------------------------------------

   Capturamos os elementos que o cliente preencherá.

   Nesta etapa ainda não enviamos nada.
*/

    const nameInput =
        document.getElementById(
            "avaliacaoNome"
        );

    const photoInput =
        document.getElementById(
            "avaliacaoFoto"
        );

    const commentInput =
        document.getElementById(
            "avaliacaoTexto"
        );

    // Atualiza o contador de caracteres em tempo real durante a digitação.
    const contadorAvaliacao =
        document.getElementById("contadorAvaliacao");

    if (commentInput && contadorAvaliacao) {
        const atualizarContador = () => {
            contadorAvaliacao.textContent =
                `${commentInput.value.length}/45 caracteres`;
        };

        commentInput.addEventListener("input", atualizarContador);
        atualizarContador();
    }

    const submitButton =
        document.getElementById(
            "enviarAvaliacao"
        );

    /*
   ---------------------------------------------------------
   CAPTURA DO ENVIO
   ---------------------------------------------------------

   Por enquanto apenas capturamos os dados
   preenchidos pelo cliente.

   O backend será conectado em uma
   próxima microcirurgia.
*/

    if (submitButton) {

        submitButton.addEventListener(
            "click",
            () => {

                const nome =
                    nameInput
                        ? nameInput.value.trim()
                        : "";

                const comentario =
                    commentInput
                        ? commentInput.value.trim()
                        : "";

                const foto =
                    photoInput &&
                        photoInput.files.length > 0
                        ? photoInput.files[0]
                        : null;


                /*
                   Neste momento temos:
    
                   nome
                   selectedRating
                   comentario
                   foto
                */


                if (!nome) {
                    alert("Por favor, indique o seu nome.");
                    nameInput?.focus();
                    return;
                }


                if (!selectedRating) {
                    alert("Por favor, escolha uma classificação de 1 a 5 estrelas.");
                    return;
                }

                if (!comentario) {
                    alert("Por favor, escreva o seu comentário.");
                    commentInput?.focus();
                    return;
                }

                if (comentario.length > 45) {
                    alert("O comentário deve ter no máximo 45 caracteres.");
                    commentInput?.focus();
                    return;
                }


                /*
    ---------------------------------------------------------
    VALIDAÇÃO DOS CAMPOS
    ---------------------------------------------------------
 
    A avaliação só pode continuar se:
    - o nome estiver preenchido;
    - uma classificação tiver sido escolhida;
    - o comentário estiver preenchido.
 */

                if (!nome) {

                    alert(
                        "Por favor, informe o seu nome."
                    );

                    if (nameInput) {
                        nameInput.focus();
                    }

                    return;
                }


                if (selectedRating === 0) {

                    alert(
                        "Por favor, escolha uma classificação de 1 a 5 estrelas."
                    );

                    return;
                }


                if (!comentario) {

                    alert(
                        "Por favor, escreva o seu comentário."
                    );

                    if (commentInput) {
                        commentInput.focus();
                    }

                    return;
                }

                console.log(
                    "Dados da avaliação:",
                    {
                        nome,
                        nota: selectedRating,
                        comentario,
                        foto
                    }
                );

                /*
 * =====================================================
 * ENVIO DA AVALIAÇÃO COM FOTO
 * =====================================================
 *
 * FormData permite enviar:
 *
 * - nome
 * - nota
 * - comentário
 * - foto
 *
 * para o endpoint multipart/form-data
 * do backend.
 * =====================================================
 */

                const dadosAvaliacao =
                    new FormData();

                // =====================================================
                // TOKEN DE AUTORIZAÇÃO DA AVALIAÇÃO
                // =====================================================
                //
                // O token vem na URL:
                //
                // ?avaliacao=TOKEN
                //
                // O backend será responsável por validar
                // se esse token pertence a um pedido concluído.
                // =====================================================

                const parametros =
                    new URLSearchParams(
                        window.location.search
                    );

                const tokenAvaliacao =
                    parametros.get("avaliacao");


                dadosAvaliacao.append(
                    "token",
                    tokenAvaliacao
                );


                dadosAvaliacao.append(
                    "nome",
                    nome
                );

                dadosAvaliacao.append(
                    "nota",
                    selectedRating
                );

                dadosAvaliacao.append(
                    "comentario",
                    comentario
                );

                /*
                 * Só adiciona a foto se o cliente
                 * realmente selecionou um arquivo.
                 */

                if (foto) {

                    dadosAvaliacao.append(
                        "foto",
                        foto
                    );
                }

                console.log(
                    "TOKEN ENVIADO:",
                    dadosAvaliacao.get("token")
                );

                fetch(
                    `${API_BASE_URL}/avaliacoes/com-foto`,
                    {
                        method: "POST",

                        /*
                         * IMPORTANTE:
                         * Não coloque Content-Type aqui.
                         *
                         * O navegador cria automaticamente:
                         * multipart/form-data + boundary
                         */

                        body: dadosAvaliacao
                    }
                )
                    .then((response) => {

                        if (!response.ok) {


                            throw new Error(
                                `Erro ao enviar avaliação. Status: ${response.status}`
                            );
                        }

                        return response.json();
                    })
                    .then((dados) => {

                        console.log("CHEGOU NO SUCESSO DO ENVIO");

                        alert(
                            "Avaliação enviada com sucesso! Obrigado pela sua avaliação."
                        );



                    })
                    .catch((error) => {

                        console.error(
                            "Erro ao enviar avaliação:",
                            error
                        );


                        alert(
                            "Não foi possível enviar a avaliação. Verifique o link e tente novamente."
                        );

                    });

            }
        );

    }

    /*
       Percorremos cada estrela.
    */

    ratingStars.forEach(
        (star) => {

            star.addEventListener(
                "click",
                () => {

                    selectedRating =
                        Number(
                            star.dataset.rating
                        );


                    /*
                       Actualizamos todas
                       as estrelas.
                    */

                    ratingStars.forEach(
                        (currentStar) => {

                            const currentRating =
                                Number(
                                    currentStar.dataset.rating
                                );


                            /*
                               Estrelas até à seleccionada:
                               ficam activas.

                               Estrelas depois:
                               ficam inactivas.
                            */

                            const isSelected =
                                currentRating <=
                                selectedRating;


                            currentStar.classList.toggle(
                                "is-selected",
                                isSelected
                            );


                            /*
                               Mantemos a informação
                               de acessibilidade actualizada.
                            */

                            currentStar.setAttribute(
                                "aria-pressed",
                                String(
                                    isSelected
                                )
                            );

                        }
                    );

                }
            );

        }
    );


    /*
       Abrir formulário.
    */

    openButton.addEventListener(
        "click",
        () => {

            formContainer.classList.remove(
                "is-hidden"
            );

            openButton.setAttribute(
                "aria-expanded",
                "true"
            );

            formContainer.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );


    /*
       Fechar formulário.
    */

    closeButton.addEventListener(
        "click",
        () => {

            formContainer.classList.add(
                "is-hidden"
            );

            openButton.setAttribute(
                "aria-expanded",
                "false"
            );

            openButton.focus();

        }
    );

}

/* =========================================================
   20. INICIALIZAÇÃO DAS PROTECÇÕES AUXILIARES
   ========================================================= */

/*
   Aqui activamos apenas os módulos auxiliares.

   Cada função verifica internamente se os elementos
   necessários existem.
*/

function initAdditionalProtections() {

    initFormChangeProtection();

    initAccessibility();

}


/* =========================================================
   21. INTEGRAÇÃO FINAL
   ========================================================= */

/*
   A inicialização complementar precisa acontecer
   depois que o DOM estiver disponível.

   Como o primeiro DOMContentLoaded já existe no início
   do arquivo, usamos um segundo listener somente para
   os módulos auxiliares que foram definidos posteriormente.

   Isso não cria conflito: ambos executam uma única vez
   quando o DOM estiver pronto.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initAdditionalProtections();

    }
);

/* =========================================================
   22. ANO AUTOMÁTICO DO RODAPÉ
   ========================================================= */

/*
   Actualiza automaticamente o ano apresentado no rodapé.

   Assim não precisamos alterar o HTML manualmente
   todos os anos.
*/

function initFooterYear() {

    /*
       Procuramos primeiro um elemento específico
       para o ano, caso exista.
    */

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    /*
       Se não existir nenhum elemento preparado
       para receber o ano, simplesmente terminamos.
    */

    if (!yearElements.length) {
        return;
    }


    /*
       Obtém o ano actual do computador/navegador.
    */

    const currentYear =
        new Date().getFullYear();


    /*
       Actualizamos todos os elementos encontrados.

       Fazemos isso com forEach para que, se no futuro
       houver mais de um local mostrando o ano,
       todos sejam actualizados.
    */

    yearElements.forEach(
        (element) => {

            element.textContent =
                currentYear;

        }
    );

}


/* =========================================================
   23. GARANTIA DE ACESSIBILIDADE DO MENU
   ========================================================= */

/*
   Pequena verificação final do estado do menu.

   Esta função não abre nem fecha o menu.

   Apenas garante que o atributo ARIA não fique
   inconsistente com a classe utilizada pelo CSS.
*/

function syncMobileMenuAccessibility() {

    const menuButton =
        document.querySelector(
            ".menu-toggle"
        );


    const navigation =
        document.querySelector(
            ".main-navigation"
        );


    /*
       Se os elementos não existirem,
       não executamos nada.
    */

    if (!menuButton || !navigation) {
        return;
    }


    /*
       Verificamos se o menu está aberto.
    */

    const isOpen =
        navigation.classList.contains(
            "is-open"
        );


    /*
       Mantemos aria-expanded sincronizado.
    */

    menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

}


/* =========================================================
   24. SEGURANÇA CONTRA ERROS DE ELEMENTOS
   ========================================================= */

/*
   O JavaScript do Limpando7 foi estruturado para que
   a ausência de um elemento não derrube o restante
   da página.

   Esta função serve apenas como verificação final
   dos principais componentes.
*/

function verifyMainElements() {

    const elements = {

        termsModal:
            document.getElementById(
                "termsModal"
            ),

        termsButton:
            document.getElementById(
                "acceptTermsBtn"
            ),

        menuButton:
            document.querySelector(
                ".menu-toggle"
            ),

        navigation:
            document.querySelector(
                ".main-navigation"
            ),

        comparison:
            document.getElementById(
                "comparison"
            ),

        quoteForm:
            document.querySelector(
                ".quote-form"
            )

    };


    /*
       Retornamos o objecto para permitir
       diagnóstico futuro pelo desenvolvedor.

       Não mostramos informações no console
       automaticamente.
    */

    return elements;

}


/* =========================================================
   25. ESTADO FINAL DO PROJECTO
   ========================================================= */

/*
   Esta função não altera o site.

   Ela apenas permite verificar se os principais módulos
   foram encontrados correctamente.
*/

function getLimpando7State() {

    return {

        termsAccepted:
            areTermsAccepted(),

        whatsappConfigured:
            isValidWhatsAppNumber(
                WHATSAPP_NUMBER
            ),

        elements:
            verifyMainElements()

    };

}
// =================================================
// HERO — CARROSSEL HORIZONTAL
// =================================================
// =================================================
// HERO — CARROSSEL HORIZONTAL
// =================================================

const heroSlides =
    document.querySelectorAll(".hero-slide");

let heroSlideAtual = 0;

if (heroSlides.length > 1) {

    setInterval(() => {

        const proxima =
            (heroSlideAtual + 1) % heroSlides.length;

        heroSlides[proxima].style.transform =
            "translateX(0)";

        heroSlides[heroSlideAtual].style.transform =
            "translateX(100%)";

        heroSlideAtual = proxima;

    }, 5000);

}

function initMapaAtuacao() {
    const elementoMapa = document.getElementById("mapa-limpando7");

    if (!elementoMapa) {
        console.error("Limpando7: elemento do mapa não encontrado.");
        return;
    }

    if (typeof maplibregl === "undefined") {
        console.error("Limpando7: biblioteca MapLibre não carregada.");
        return;
    }

    if (elementoMapa.dataset.mapaInicializado === "true") return;
    elementoMapa.dataset.mapaInicializado = "true";

    const mapa = new maplibregl.Map({
        container: elementoMapa,
        style: "https://tiles.openfreemap.org/styles/dark",
        center: [-9.1393, 38.7223],
        zoom: 9.5,
        attributionControl: true
    });

    mapa.addControl(new maplibregl.NavigationControl(), "top-left");

    const localidades = [
        { nome: "Lisboa", coordenadas: [-9.1393, 38.7223] },
        { nome: "Sintra", coordenadas: [-9.3817, 38.8029] },
        { nome: "Cascais", coordenadas: [-9.4215, 38.6979] }
    ];

    const raioCoberturaKm = 15;

    mapa.on("load", () => {
        // Efeito azul neon nas camadas de estradas.
        mapa.getStyle().layers.forEach((camada) => {
            const id = camada.id.toLowerCase();

            const eEstrada =
                id.includes("road") ||
                id.includes("transportation") ||
                id.includes("street") ||
                id.includes("highway");

            if (eEstrada && camada.type === "line") {
                mapa.setPaintProperty(
                    camada.id,
                    "line-color",
                    "#20aaff"
                );

                mapa.setPaintProperty(
                    camada.id,
                    "line-opacity",
                    0.95
                );
            }
        });


        // Prepara as áreas geográficas de cobertura.
        const circulosCobertura = localidades.map((localidade) => {
            const [longitude, latitude] = localidade.coordenadas;
            const raioMetros = raioCoberturaKm * 1000;
            const pontos = [];
            const segmentos = 96;

            for (let i = 0; i <= segmentos; i++) {
                const angulo = (i / segmentos) * 2 * Math.PI;
                const raioLatitude = raioMetros / 111320;
                const raioLongitude =
                    raioMetros /
                    (111320 * Math.cos(latitude * Math.PI / 180));

                pontos.push([
                    longitude + raioLongitude * Math.cos(angulo),
                    latitude + raioLatitude * Math.sin(angulo)
                ]);
            }

            return {
                type: "Feature",
                properties: {
                    nome: localidade.nome
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [pontos]
                }
            };
        });


        mapa.addSource("limpando7-cobertura", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: circulosCobertura
            }
        });


        mapa.addLayer({
            id: "limpando7-cobertura-preenchimento",
            type: "fill",
            source: "limpando7-cobertura",
            paint: {
                "fill-color": "#078cff",
                "fill-opacity": 0.16
            }
        });

        mapa.addLayer({
            id: "limpando7-cobertura-contorno",
            type: "line",
            source: "limpando7-cobertura",
            paint: {
                "line-color": "#20aaff",
                "line-width": 2.5,
                "line-opacity": 0.95
            }
        });




        // Mantém os três marcadores e os respetivos popups.
        localidades.forEach((localidade) => {
            const marcador = document.createElement("div");
            marcador.className = "limpando7-pin-neon";
            marcador.setAttribute("aria-label", localidade.nome);
            marcador.title = localidade.nome;

            new maplibregl.Marker({
                element: marcador,
                anchor: "center"
            })
                .setLngLat(localidade.coordenadas)
                .setPopup(
                    new maplibregl.Popup({ offset: 24 })
                        .setHTML(
                            "<strong>" + localidade.nome +
                            "</strong><br>Limpando7 — Higienização &amp; Estofos"
                        )
                )
                .addTo(mapa);
        });
    });

    setTimeout(() => mapa.resize(), 300);
}
