import { useEffect, useState } from "react";

type ApiResponse = { message: string };

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function App() {
  const [message, setMessage] = useState("Conectando ao backend...");

  useEffect(() => {
    fetch(`${apiUrl}/api/hello`)
      .then((response) => response.json() as Promise<ApiResponse>)
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Não foi possível conectar ao backend."));
  }, []);

  return (
    <main>
      <section>
        <p className="tag">Primeira etapa do projeto</p>
        <h1>Software Educacional para o Ensino de Compiladores</h1>
        <p>
          A base da aplicação está funcionando. Nas próximas etapas, esta interface
          receberá o editor de código e as visualizações das análises léxica e sintática.
        </p>
        <div className="message" role="status">{message}</div>
      </section>
    </main>
  );
}
