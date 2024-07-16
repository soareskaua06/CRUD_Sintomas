const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const dadosPath = path.join(__dirname, 'dados.json');

// Endpoint para obter todas as respostas
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

// Endpoint para adicionar uma nova resposta
app.post('/api/adicionar-resposta', (req, res) => {
    const { question1, question2, question3, question4, question5 } = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        const newId = jsonData.answers.length + 1;

        const newAnswer = {
            id: newId,
            question1: question1,
            question2: question2,
            question3: question3,
            question4: question4,
            question5: question5
        };

        jsonData.answers.push(newAnswer);

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.json(newAnswer);
        });
    });
});

// Endpoint para excluir uma resposta
app.delete('/api/excluir-resposta/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);
        const updatedAnswers = jsonData.answers.filter(answer => answer.id !== parseInt(id));

        const updatedData = {
            answers: updatedAnswers
        };

        fs.writeFile(dadosPath, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.status(200).send('Resposta excluída com sucesso.');
        });
    });
});

// Endpoint para editar uma resposta
app.put('/api/editar-resposta/:id', (req, res) => {
    const { id } = req.params;
    const { question1, question2, question3, question4, question5 } = req.body;

    fs.readFile(dadosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo dados.json:', err);
            res.status(500).send('Erro interno do servidor.');
            return;
        }

        const jsonData = JSON.parse(data);

        const answerIndex = jsonData.answers.findIndex(answer => answer.id === parseInt(id));
        if (answerIndex === -1) {
            res.status(404).send('Resposta não encontrada.');
            return;
        }

        jsonData.answers[answerIndex].question1 = question1;
        jsonData.answers[answerIndex].question2 = question2;
        jsonData.answers[answerIndex].question3 = question3;
        jsonData.answers[answerIndex].question4 = question4;
        jsonData.answers[answerIndex].question5 = question5;

        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFile(dadosPath, updatedData, (err) => {
            if (err) {
                console.error('Erro ao salvar dados no arquivo dados.json:', err);
                res.status(500).send('Erro interno do servidor.');
                return;
            }

            res.json(jsonData.answers[answerIndex]);
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
