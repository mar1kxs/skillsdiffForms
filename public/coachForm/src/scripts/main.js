const form = document.querySelector(".form");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.querySelector("input[name='name']").value;
  const email = document.querySelector("input[name='email']").value;
  const age = document.querySelector("input[name='age']").value;
  const city = document.querySelector("input[name='city']").value;
  const discipline = document.getElementById("discipline").value;
  const experience = document.querySelector("input[name='experience']").value;
  const telegram = document.querySelector("input[name='tg']").value;

  let tg = telegram.startsWith("@") ? telegram.substring(1) : telegram;

  const data = { name, email, age, tg, city, discipline, experience };

  try {
    const response = await fetch(
      "https://hook.eu2.make.com/gix103o3dtlf2uuayq5uklhdkcvla8x9",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const success = document.querySelector(".form-success");
    success.classList.add("show");
    form.reset();
  } catch (error) {
    console.error(error);
    alert("Произошла ошибка. Попробуйте позже.");
  }
});
