let username = "";
let mode = "en2ja";
let score = 0;

async function startQuiz() {
  username = document.getElementById("username").value;
  mode = document.getElementById("mode").value;
  score = 0;

  document.getElementById("setup").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  nextQuestion();
}

async function nextQuestion() {
  const res = await fetch(`/quiz?mode=${mode}`);
  const data = await res.json();

  document.getElementById("question").innerText = data.question;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  data.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => submitAnswer(data, choice);
    choicesDiv.appendChild(btn);
  });
}

async function submitAnswer(data, choice) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("question", data.question);
  formData.append("answer", data.answer);
  formData.append("user_answer", choice);

  const res = await fetch("/answer", { method: "POST", body: formData });
  const result = await res.json();

  if (result.correct) {
    document.getElementById("result").innerText = "正解！";
    score++;
  } else {
    document.getElementById("result").innerText = `不正解！ 正解は ${data.answer}`;
  }

  setTimeout(nextQuestion, 1000);
}

async function loadRanking() {
  const res = await fetch("/ranking");
  const ranking = await res.json();
  const list = document.getElementById("ranking-list");
  list.innerHTML = "";
  ranking.forEach(r => {
    const li = document.createElement("li");
    li.innerText = `${r.username} - ${r.score}`;
    list.appendChild(li);
  });
}

setInterval(loadRanking, 5000); // 5秒ごとに更新
