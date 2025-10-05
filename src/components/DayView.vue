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
          <tr v-for="(desk, index) in desks" :key="desk" :class="`desk-row desk-color-${index}`">
            <td>Desk {{ desk }}</td>
            <td
              v-for="slot in timeSlots"
              :key="slot"
              :class="{'reserved': isReserved(desk, slot)}"
            >
              {{ getReservationName(desk, slot) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default {
  setup() {
    const desks = [1, 2, 3, 4, 5, 6, 7, 8];
    const selectedDate = ref(new Date().toISOString().slice(0, 10));
    const reservations = ref([]);

    // Création des créneaux
    const timeSlots = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
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
          .map((doc) => doc.data())
          .filter((r) => {
            const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
            return start.toISOString().slice(0, 10) === selectedDate.value;
          });
      });
    };

    onMounted(fetchReservationsRealtime);
    watch(selectedDate, fetchReservationsRealtime);

    const isReserved = (deskId, slot) => {
      return reservations.value.some((r) => {
        const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
        const end = r.endTime.toDate ? r.endTime.toDate() : new Date(r.endTime);
        const [h, m] = slot.split(":");
        const slotDate = new Date(`${selectedDate.value}T${h}:${m}:00`);
        return slotDate >= start && slotDate < end && r.deskId === deskId;
      });
    };

    const getReservationName = (deskId, slot) => {
      const res = reservations.value.find((r) => {
        const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
        const end = r.endTime.toDate ? r.endTime.toDate() : new Date(r.endTime);
        const [h, m] = slot.split(":");
        const slotDate = new Date(`${selectedDate.value}T${h}:${m}:00`);
        return slotDate >= start && slotDate < end && r.deskId === deskId;
      });
      return res ? res.userName : "";
    };

    return { desks, selectedDate, timeSlots, isReserved, getReservationName };
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
  max-width: 1200px;
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
}

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
