 
const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')

const dicaDisplay = document.getElementById('dica-display')

const audioAcerto = new Audio('acerto.mp3')
const audioErro = new Audio('erro.mp3')
const audioGanhou = new Audio('ganhou.mp3')
const audioPerdeu = new Audio('perdeu.mp3')


const USE_API = 'https://api-palavras-8ptt.onrender.com'

async function iniciarJogo(event) {
    if (event.key == "Enter") {
        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('O meu amigo, preencha o nickname')
            return
        }

        const response = await fetch(`${USE_API}/iniciar`,
            {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {nickname: nickname} )
            }
        );

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')
        document.getElementById('player-display').innerText = data.mensagem

        buscarPalavra()
    }
}

async function buscarPalavra() {
    const response = await fetch(`${USE_API}/status`, {
        credentials: 'include',
        method: 'GET'
    })

    const data = await response.json()

    console.log(data)

    dicaDisplay.innerText = `Dica: ${data.dica}`

    wordDisplay.innerHTML = ''

    for (let i=0; i < data.qtde_caracteres; i++) {
        const span = document.createElement('span')
        span.className = 'letter-slot'
        span.id = `slot-${i}`
        wordDisplay.appendChild(span)
    }
}

async function tentarLetra(event) {
    if (event.key == "Enter") {
        const input = document.getElementById('letter-input')
        const caractere = input.value
        input.value = ''
        input.focus()

        if (!caractere) {
            alert('Digite um caractere para jogar!')
            return
        }

        const response = await fetch(`${USE_API}/tentativa`, {
            method: 'POST', 
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {caractere: caractere} )
        })

        const data = await response.json()

        data.posicoes.forEach(pos => {
            document.getElementById(`slot-${pos}`).innerText = caractere
        })

        if (data.posicoes.length > 0) {
            audioAcerto.play()
            document.body.style.background = "linear-gradient(135deg, #b9ffb9, #e8ffe8, #ffffff)"
        } else {
            audioErro.play()
            document.body.style.background = "linear-gradient(135deg, #ffb3b3, #ffd6d6, #ffffff)"
        }

        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem

        if (data.status_jogo != 'Jogando') {
            resetBtn.classList.remove('hidden')

            if (data.status_jogo == 'Derrota') {
                gameMessage.style.color = 'red'

                gameMessage.innerText = `${data.mensagem} A palavra era: ${data.palavra_sorteada}`

                audioPerdeu.play()
                document.body.style.background = "linear-gradient(135deg, #ff5f5f, #ffb3b3, #ffe5e5)"

                await mostrarPalavraCorreta()

            } else {
                gameMessage.style.color = 'green'

                audioGanhou.play()
                document.body.style.background = "linear-gradient(135deg, #ffe3f2, #ffacda, #ffe9f5)"
            }
        }
    }
}

function reiniciarJogo() {
    location.reload()
}
