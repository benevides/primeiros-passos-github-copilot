document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Renderiza lista de participantes
        let participantsHTML = '';
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <ul class="participants-list no-bullets">
                ${details.participants.map(p => `
                  <li style="display: flex; align-items: center; gap: 6px;">
                    <span>${p}</span>
                    <button class="delete-participant-btn" title="Remover" data-activity="${name}" data-email="${p}" style="background: none; border: none; cursor: pointer; color: #c62828; font-size: 18px; padding: 0;">
                      <span aria-label="Remover" role="img">🗑️</span>
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section empty">
              <em>Nenhum participante inscrito ainda.</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Agenda:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidade:</strong> ${spotsLeft} vagas disponíveis</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Adiciona evento aos botões de deletar participantes
      activitiesList.querySelectorAll('.delete-participant-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const activity = btn.getAttribute('data-activity');
          const email = btn.getAttribute('data-email');
          if (!confirm(`Remover ${email} de ${activity}?`)) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/remove?email=${encodeURIComponent(email)}`, {
              method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Erro ao remover participante.";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
          } catch (error) {
            messageDiv.textContent = "Erro ao remover participante.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
