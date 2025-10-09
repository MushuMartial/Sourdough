<template> 
  <div class="day-view">
    <h3>View day: {{ selectedDate }}</h3>

    <div class="date-picker">
      <label>Choose a date:</label>
      <input type="date" v-model="selectedDate" />
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Desk</th>
            <th v-for="slot in timeSlots" :key="slot">{{ slot }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(desk, index) in desks"
            :key="desk"
            :class="`desk-row desk-color-${index}`"
          >
            <td>Desk {{ desk }}</td>
            <td
              v-for="slot in timeSlots"
              :key="slot"
              :class="{ reserved: isReserved(desk, slot) }"
              @mouseenter="handleHover(desk, slot)"
              @mouseleave="hoveredReservation = null"
            >
              <div class="cell-content">
                <span class="reservation-name">{{ getReservationName(desk, slot) }}</span>
                <button
                  v-if="isReserved(desk, slot)"
                  class="delete-icon"
                  @click.stop="openConfirmPopover(desk, slot)"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 💬 Mini Popover de confirmation -->
    <div v-if="confirmPopover" class="confirm-popover">
      <p>
        Delete this reservation
        <strong>{{ confirmPopover.reservation.userName }}</strong> ?
      </p>
      <div class="buttons">
        <button @click="confirmDelete" class="delete">Yes</button>
        <button @click="confirmPopover = null" class="cancel">No</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default {
  setup() {
    const desks = [1, 2, 3, 4, 5, 6, 7, 8];
    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    const reservations = ref([]);
    const hoveredReservation = ref(null);
    const confirmPopover = ref(null);

    // Créneaux horaires
    const timeSlots = [];
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        timeSlots.push(`${hh}:${mm}`);
      }
    }

    let unsubscribe = null;

    const fetchReservationsRealtime = () => {
      if (unsubscribe) unsubscribe();
      const q = query(collection(db, "reservations"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        reservations.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((r) => {
            const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
            return start.toISOString().slice(0, 10) === selectedDate.value;
          });
      });
    };

    onMounted(fetchReservationsRealtime);
    watch(selectedDate, fetchReservationsRealtime);

    const getReservation = (deskId, slot) => {
      return reservations.value.find((r) => {
        const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
        const end = r.endTime.toDate ? r.endTime.toDate() : new Date(r.endTime);
        const [h, m] = slot.split(":");
        const slotDate = new Date(`${selectedDate.value}T${h}:${m}:00`);
        return slotDate >= start && slotDate < end && r.deskId === deskId;
      });
    };

    const isReserved = (deskId, slot) => !!getReservation(deskId, slot);

    const getReservationName = (deskId, slot) => {
      const res = getReservation(deskId, slot);
      return res ? res.userName : "";
    };

    const handleHover = (deskId, slot) => {
      const res = getReservation(deskId, slot);
      if (res) hoveredReservation.value = { deskId, slot };
    };

    const openConfirmPopover = (deskId, slot) => {
      const res = getReservation(deskId, slot);
      if (res) confirmPopover.value = { deskId, slot, reservation: res };
    };

    const confirmDelete = async () => {
      if (!confirmPopover.value) return;
      await deleteDoc(doc(db, "reservations", confirmPopover.value.reservation.id));
      confirmPopover.value = null;
    };

    return {
      desks,
      selectedDate,
      timeSlots,
      reservations,
      isReserved,
      getReservationName,
      hoveredReservation,
      handleHover,
      confirmPopover,
      openConfirmPopover,
      confirmDelete,
    };
  },
};
</script>

<style scoped>
.day-view {
  background-color: #fafafa;
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  width: 1200px;
  margin: 40px auto;
}

.day-view h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  color: #222;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.date-picker label {
  font-weight: 500;
}

.date-picker input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.date-picker input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  background-color: white;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 1100px;
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
}

thead th {
  background-color: #f2f2f7;
  color: #333;
  font-weight: 600;
  padding: 10px;
  text-align: center;
  border-bottom: 2px solid #ddd;
  position: sticky;
  top: 0;
  z-index: 1;
}

td {
  padding: 8px;
  text-align: center;
  border: 1px solid #e5e5ea;
  transition: background-color 0.2s;
  position: relative;
}

tr:hover td {
  background-color: #f9f9fb;
}

.desk-row td:first-child {
  font-weight: 600;
  background-color: #f9fafc;
  border-right: 2px solid #ddd;
}

.reserved {
  background-color: #007aff;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* ✅ Cellule avec icône poubelle */
.cell-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reservation-name {
  display: inline-block;
}

.delete-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8); /* centré + échelle initiale */
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px; /* plus lisible */
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: auto;
}

.reserved:hover .delete-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1); /* centré + agrandi au hover */
}

/* Mini popover */
.confirm-popover {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 18px 24px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  text-align: center;
  animation: fadeIn 0.2s ease;
  z-index: 200;
}

.confirm-popover .buttons {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-popover .delete {
  background: #ff3b30;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}

.confirm-popover .cancel {
  background: #ccc;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -45%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}

/* Couleurs par desk */
.desk-color-0 td:first-child { background-color: #e6f7ff; }
.desk-color-1 td:first-child { background-color: #fff1e6; }
.desk-color-2 td:first-child { background-color: #f3e6ff; }
.desk-color-3 td:first-child { background-color: #e9fbe6; }
.desk-color-4 td:first-child { background-color: #fffbe6; }
.desk-color-5 td:first-child { background-color: #ffe9e6; }
.desk-color-6 td:first-child { background-color: #f1f1f1; }
.desk-color-7 td:first-child { background-color: #e6f3ff; }

@media (max-width: 900px) {
  .day-view {
    padding: 20px;
  }

  table {
    font-size: 12px;
    min-width: 900px;
  }

  .date-picker {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
