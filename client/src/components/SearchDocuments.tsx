import { useState } from "react";

type Source = {
  source: string;
  chunkIndex: number;
};

function SearchDocuments() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setMessage("Please enter a question.");
      return;
    }

    try {
      setMessage("Thinking...");
      setAnswer("");
      setSources([]);

      const response = await fetch(
        "http://localhost:5000/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Question failed."
        );
      }

      setAnswer(data.answer);
      setSources(data.sources);
      setMessage("");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <div>
      <h2>Ask About Your Documents</h2>

      <input
        type="text"
        value={query}
        placeholder="Ask a question..."
        onChange={(event) =>
          setQuery(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleSearch();
          }
        }}
      />

      <button onClick={handleSearch}>
        Ask
      </button>

      {message && <p>{message}</p>}

      {answer && (
        <div>
          <h3>Answer</h3>

          <p>{answer}</p>

          {sources.length > 0 && (
            <>
              <h4>Sources</h4>

              <ul>
                {sources.map((source, index) => (
                  <li key={index}>
                    {source.source} — Chunk{" "}
                    {source.chunkIndex}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchDocuments;