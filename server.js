const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

const dadosPath = path.join(__dirname, 'dados.json');

app.get('/api/respostas', (req, res) => {
    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }
        const jsonData = JSON.parse(data);
        res.json(jsonData.answers);
    });
});

app.post('/api/adicionar-resposta', (req, res) => {
    const resposta = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        jsonData.answers.push(resposta);

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            const analise = analisarRespostas(resposta);
            res.status(201).json({ resposta, analise });
        });
    });
});

function analisarRespostas(resposta) {
    const sintomas = {
        "IST1": { perguntas: ["question1", "question2"], descricao: "IST Tipo 1" },
        "IST2": { perguntas: ["question3", "question4"], descricao: "IST Tipo 2" },
        "IST3": { perguntas: ["question5"], descricao: "IST Tipo 3" }
    };

    const resultados = {};

    Object.keys(sintomas).forEach(ist => {
        const { perguntas, descricao } = sintomas[ist];
        const pontuacao = perguntas.reduce((acc, pergunta) => acc + (resposta[pergunta] === "Sim" ? 1 : 0), 0);
        const porcentagem = (pontuacao / perguntas.length) * 100;
        resultados[ist] = { descricao, porcentagem };
    });

    return resultados;
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
