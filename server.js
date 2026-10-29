const cors = require("cors");
const express = require("express");
const app = express()
app.use(cors({
    origin: "https://srinathjanga.github.io"
    }));

app.use(express.json());

let polls = [];

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LiveVote</title>
  <style>
  body{font-family:Arial;background:#f2f3ff;padding:20px;color:#222}
  main{max-width:600px;margin:auto}
  section{background:white;padding:20px;margin:15px 0;border-radius:14px}
  input{padding:12px;width:90%;margin:6px 0}
  button{background:#5146e5;color:white;border:0;padding:12px;
  border-radius:8px;margin:5px;cursor:pointer}
  .bar{background:#ddd;height:9px;border-radius:8px}
  .fill{background:#5146e5;height:9px;border-radius:8px}
  </style>
  </head>
  <body>
  <main>
  <h1>🗳️ LiveVote</h1>
  <p>Create a poll and share your opinion!</p>

  <section>
  <h3>Create a poll</h3>
  <input id="q" placeholder="Your question">
  <div id="choices">
  <input class="option" placeholder="Option 1">
  <input class="option" placeholder="Option 2">
  </div>
  <button onclick="addOption()">Add option</button>
  <button onclick="createPoll()">Create poll</button>
  <p id="msg"></p>
  </section>

  <section>
  <h3>Polls</h3>
  <div id="polls">Loading...</div>
  </section>

  <script>
  async function api(url, data) {
    const r = await fetch(url, {
        method: data ? "POST" : "GET",
            headers: {"Content-Type":"application/json"},
                body: data ? JSON.stringify(data) : undefined
                  });
                    const result = await r.json();
                      if (!r.ok) throw new Error(result.error || "Request failed");
                        return result;
                        }

                        function addOption() {
                          if (document.querySelectorAll(".option").length >= 10) return;
                            const input = document.createElement("input");
                              input.className = "option";
                                input.placeholder = "Another option";
                                  document.getElementById("choices").append(input);
                                  }

                                  async function createPoll() {
                                    try {
                                        const question = document.getElementById("q").value.trim();
                                            const options = [...document.querySelectorAll(".option")]
                                                  .map(x => x.value.trim()).filter(Boolean);

                                                      if (!question || options.length < 2) {
                                                            throw new Error("Enter a question and at least two options.");
                                                                }

                                                                    const poll = await api("/api/polls", {question, options});
                                                                        document.getElementById("msg").textContent = "Poll created!";
                                                                            document.getElementById("q").value = "";
                                                                                document.querySelectorAll(".option").forEach(x => x.remove());
                                                                                    document.getElementById("choices").innerHTML =
                                                                                          '<input class="option" placeholder="Option 1">' +
                                                                                                '<input class="option" placeholder="Option 2">';
                                                                                                    history.replaceState(null, "", "/?poll=" + poll.id);
                                                                                                        await loadPolls();
                                                                                                          } catch (e) {
                                                                                                              document.getElementById("msg").textContent = e.message;
                                                                                                                }
                                                                                                                }

                                                                                                                async function vote(id, index) {
                                                                                                                  try {
                                                                                                                      await api("/api/polls/" + id + "/vote", {index});
                                                                                                                          await loadPolls();
                                                                                                                            } catch(e) {
                                                                                                                                alert(e.message);
                                                                                                                                  }
                                                                                                                                  }

                                                                                                                                  async function loadPolls() {
                                                                                                                                    const polls = await api("/api/polls");
                                                                                                                                      const area = document.getElementById("polls");
                                                                                                                                        area.replaceChildren();

                                                                                                                                          if (!polls.length) {
                                                                                                                                              area.textContent = "No polls yet. Create the first one!";
                                                                                                                                                  return;
                                                                                                                                                    }

                                                                                                                                                      polls.forEach(p => {
                                                                                                                                                          const card = document.createElement("div");
                                                                                                                                                              const title = document.createElement("h3");
                                                                                                                                                                  title.textContent = p.question;
                                                                                                                                                                      card.append(title);

                                                                                                                                                                          const total = p.options.reduce((s,o) => s + o.votes, 0);

                                                                                                                                                                              p.options.forEach((o,i) => {
                                                                                                                                                                                    const b = document.createElement("button");
                                                                                                                                                                                          b.textContent = o.text;
                                                                                                                                                                                                b.onclick = () => vote(p.id, i);

                                                                                                                                                                                                      const label = document.createElement("p");
                                                                                                                                                                                                            const percent = total ? Math.round(o.votes / total * 100) : 0;
                                                                                                                                                                                                                  label.textContent = o.votes + " votes (" + percent + "%)";

                                                                                                                                                                                                                        const bar = document.createElement("div");
                                                                                                                                                                                                                              bar.className = "bar";
                                                                                                                                                                                                                                    const fill = document.createElement("div");
                                                                                                                                                                                                                                          fill.className = "fill";
                                                                                                                                                                                                                                                fill.style.width = percent + "%";
                                                                                                                                                                                                                                                      bar.append(fill);

                                                                                                                                                                                                                                                            card.append(b, label, bar);
                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                    const share = document.createElement("button");
                                                                                                                                                                                                                                                                        share.textContent = "Copy poll link";
                                                                                                                                                                                                                                                                            share.onclick = async () => {
                                                                                                                                                                                                                                                                                  const url = location.origin + "/?poll=" + p.id;
                                                                                                                                                                                                                                                                                        try {
                                                                                                                                                                                                                                                                                                await navigator.clipboard.writeText(url);
                                                                                                                                                                                                                                                                                                        alert("Poll link copied!");
                                                                                                                                                                                                                                                                                                              } catch {
                                                                                                                                                                                                                                                                                                                      prompt("Copy this link:", url);
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                };

                                                                                                                                                                                                                                                                                                                                    card.append(share, document.createElement("hr"));
                                                                                                                                                                                                                                                                                                                                        area.append(card);
                                                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                                                          }

                                                                                                                                                                                                                                                                                                                                          loadPolls();
                                                                                                                                                                                                                                                                                                                                          setInterval(loadPolls, 5000);
                                                                                                                                                                                                                                                                                                                                          </script>
                                                                                                                                                                                                                                                                                                                                          </main>
                                                                                                                                                                                                                                                                                                                                          </body>
                                                                                                                                                                                                                                                                                                                                          </html>
                                                                                                                                                                                                                                                                                                                                            `);
                                                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                                                            app.get("/api/polls", (req, res) => res.json(polls));

                                                                                                                                                                                                                                                                                                                                            app.post("/api/polls", (req, res) => {
                                                                                                                                                                                                                                                                                                                                              const {question, options} = req.body;

                                                                                                                                                                                                                                                                                                                                                if (typeof question !== "string" ||
                                                                                                                                                                                                                                                                                                                                                      !question.trim() ||
                                                                                                                                                                                                                                                                                                                                                            question.length > 200 ||
                                                                                                                                                                                                                                                                                                                                                                  !Array.isArray(options) ||
                                                                                                                                                                                                                                                                                                                                                                        options.length < 2 ||
                                                                                                                                                                                                                                                                                                                                                                              options.length > 10 ||
                                                                                                                                                                                                                                                                                                                                                                                    !options.every(o => typeof o === "string" &&
                                                                                                                                                                                                                                                                                                                                                                                            o.trim() && o.trim().length <= 100)) {
                                                                                                                                                                                                                                                                                                                                                                                                return res.status(400).json({error:"Invalid question or options"});
                                                                                                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                                                                                                    const poll = {
                                                                                                                                                                                                                                                                                                                                                                                                        id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
                                                                                                                                                                                                                                                                                                                                                                                                            question: question.trim(),
                                                                                                                                                                                                                                                                                                                                                                                                                options: options.map(text => ({text:text.trim(), votes:0}))
                                                                                                                                                                                                                                                                                                                                                                                                                  };

                                                                                                                                                                                                                                                                                                                                                                                                                    polls.unshift(poll);
                                                                                                                                                                                                                                                                                                                                                                                                                      res.status(201).json(poll);
                                                                                                                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                                                                                                                      app.post("/api/polls/:id/vote", (req, res) => {
                                                                                                                                                                                                                                                                                                                                                                                                                        const poll = polls.find(p => p.id === req.params.id);
                                                                                                                                                                                                                                                                                                                                                                                                                          const index = req.body.index;

                                                                                                                                                                                                                                                                                                                                                                                                                            if (!poll) return res.status(404).json({error:"Poll not found"});
                                                                                                                                                                                                                                                                                                                                                                                                                              if (!Number.isInteger(index) || !poll.options[index]) {
                                                                                                                                                                                                                                                                                                                                                                                                                                  return res.status(400).json({error:"Invalid option"});
                                                                                                                                                                                                                                                                                                                                                                                                                                    }

                                                                                                                                                                                                                                                                                                                                                                                                                                      poll.options[index].votes++;
                                                                                                                                                                                                                                                                                                                                                                                                                                        res.json(poll);
                                                                                                                                                                                                                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                                                                                                                                                                                                                        const PORT = process.env.PORT || 3000;
                                                                                                                                                                                                                                                                                                                                                                                                                                        app.listen(PORT, "0.0.0.0", () => {
                                                                                                                                                                                                                                                                                                                                                                                                                                          console.log("LiveVote running on port " + PORT);
                                                                                                                                                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                                                                                                                                                          