
# 🚗 Gerenciador de Caronas Cíclicas

Bem-vindo ao projeto **Gerenciador de Caronas Cíclicas**! Este sistema simples tem como objetivo organizar a ordem de caronas entre um grupo de pessoas de forma **cíclica e justa**.

## 📌 Objetivo

Permitir que pessoas se cadastrem para oferecer carona e manter uma ordem rotativa onde, após dar carona, o participante volta ao final da fila. Além disso, o sistema deve enviar **notificações por navegador e e-mail**.

---

## 🧠 Regras de Negócio

- 👥 **Cadastro de Participantes**: qualquer pessoa pode se cadastrar para oferecer carona.
- 🔁 **Ordem Cíclica**: quem deu a última carona vai automaticamente para o final da fila.
- 🚪 **Saída da Fila**: o participante pode sair da fila, caso não queira mais oferecer carona.
- 🔔 **Notificações**:
  - Notificação via navegador ao próximo da fila.
  - Notificação via e-mail ao ser inserido na fila ou ser o próximo a dar carona.

---

## 🗃️ Estrutura Inicial do Banco de Dados

### Tabela: `usuarios`
| Campo        | Tipo         | Descrição                      |
|--------------|--------------|--------------------------------|
| id           | INTEGER (PK) | Identificador único            |
| nome         | TEXT         | Nome do participante           |
| email        | TEXT         | E-mail para notificações       |
| dataCadastro | DATETIME     | Data de entrada na fila        |
| ativo        | BOOLEAN      | Indica se ainda está na fila   |

### Tabela: `fila_caronas`
| Campo        | Tipo         | Descrição                           |
|--------------|--------------|-------------------------------------|
| id           | INTEGER (PK) | Identificador único                 |
| idUsuario    | INTEGER (FK) | Referência ao participante          |
| posicao      | INTEGER      | Posição atual na fila               |
| ultimaCarona | DATETIME     | Data da última carona realizada     |

---

## 🧪 Funcionalidades

- ✅ Cadastro de novos participantes
- ✅ Exibição da fila atual
- 🔄 Reordenação automática após carona
- 🚫 Saída manual da fila
- 🔔 Notificações via navegador e e-mail

---

## 🚀 Como Rodar Localmente

```bash
git clone https://github.com/tainanflores/gerenciador-caronas.git
cd gerenciador-caronas
```

- Crie um servidor local simples com:

```bash
# Usando Python 3
python -m http.server
```

- Acesse via `http://localhost:8000` no navegador.

---

## 🌐 Hospedagem Gratuita

Você pode usar o **GitHub Pages** para hospedar o front-end gratuitamente.

---

## 👨‍💻 Desenvolvedor

- **Tainan Flores**
- GitHub: [@tainanflores](https://github.com/tainanflores)

---

## 📬 Licença

Este projeto é de uso livre para fins educacionais.
