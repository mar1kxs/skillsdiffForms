document.querySelector(".form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.querySelector("input[name='name']").value;
  const email = document.querySelector("input[name='email']").value;
  const age = document.querySelector("input[name='age']").value;
  const city = document.querySelector("input[name='city']").value;
  const discipline = document.getElementById("discipline").value;
  const experience = document.querySelector("input[name='experience']");
  const telegram = document.querySelector("input[name='tg']").value;

  let tg;

  if (telegram.startsWith("@")) {
    tg = telegram.substring(1);
  } else {
    tg = telegram;
  }

  const data = {
    name: name,
    email: email,
    age: age,
    tg: tg,
    city: city,
    discipline: discipline,
    experience: experience,
  };

  try {
    const response = await fetch(
      "https://hook.eu2.make.com/nb3ay4pcc321osmjtqiyihu1x18v6uv0",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Ошибка отправки данных");
    } else {
      const success = document.querySelector(".form-success");
      success.style.display = "block";
      success.classList.add("show");
      setTimeout(() => {
        success.classList.remove("show");
        success.style.display = "none";
      }, 3000);
    }
  } catch (error) {
    console.error(error);
    alert("Произошла ошибка. Попробуйте позже.");
  }
});
