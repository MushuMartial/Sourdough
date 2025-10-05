<template>
  <div class="day-view">
    <h3>Vue du jour : {{ selectedDate }}</h3>

    <div class="date-picker">
      <label>Choisir une date :</label>
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
            <td v-for="slot in timeSlots" :key="slot"
                :class="{'reserved': isReserved(desk, slot)}">
              {{ getReservationName(desk, slot) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default {
  setup() {
    const desks = [1,2,3,4,5,6,7,8];
    const selectedDate = ref(new Date().toISOString().slice(0,10));
    const reservations = ref([]);

    // Créneaux 08:00 à 18:00 par 15 min
    const timeSlots = [];
    for(let h=8; h<=18; h++) {
      for(let m=0; m<60; m+=15) {
        const hh = h.toString().padStart(2,'0');
        const mm = m.toString().padStart(2,'0');
        timeSlots.push(`${hh}:${mm}`);
      }
    }

    let unsubscribe = null;

    const fetchReservationsRealtime = () => {
      if (unsubscribe) unsubscribe();

      const q = query(collection(db, "reservations"));
      unsubscribe = onSnapshot(q, snapshot => {
        reservations.value = snapshot.docs
          .map(doc => doc.data())
          .filter(r => {
            // convertir Timestamp en Date si nécessaire
            const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
            return start.toISOString().slice(0,10) === selectedDate.value;
          });
      });
    };

    onMounted(fetchReservationsRealtime);

    watch(selectedDate, () => {
      fetchReservationsRealtime();
    });

    const isReserved = (deskId, slot) => {
      return reservations.value.some(r => {
        const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
        const end = r.endTime.toDate ? r.endTime.toDate() : new Date(r.endTime);
        const [h,m] = slot.split(':');
        const slotDate = new Date(`${selectedDate.value}T${h}:${m}:00`);
        return slotDate >= start && slotDate < end && r.deskId === deskId;
      });
    };

    const getReservationName = (deskId, slot) => {
      const res = reservations.value.find(r => {
        const start = r.startTime.toDate ? r.startTime.toDate() : new Date(r.startTime);
        const end = r.endTime.toDate ? r.endTime.toDate() : new Date(r.endTime);
        const [h,m] = slot.split(':');
        const slotDate = new Date(`${selectedDate.value}T${h}:${m}:00`);
        return slotDate >= start && slotDate < end && r.deskId === deskId;
      });
      return res ? res.userName : '';
    };

    return { desks, selectedDate, timeSlots, isReserved, getReservationName };
  }
};
</script>

<style scoped>
.day-view {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: Arial, sans-serif;
}

.date-picker {
  margin-bottom: 15px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 1200px;
}

th, td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
  min-width: 50px;
  font-size: 13px;
}

thead th {
  background-color: #f4f4f4;
  position: sticky;
  top: 0;
  z-index: 1;
}

.desk-row td:first-child {
  font-weight: bold;
}

.desk-color-0 td:first-child { background-color: #e0f7fa; }
.desk-color-1 td:first-child { background-color: #ffe0b2; }
.desk-color-2 td:first-child { background-color: #e1bee7; }
.desk-color-3 td:first-child { background-color: #c8e6c9; }
.desk-color-4 td:first-child { background-color: #fff9c4; }
.desk-color-5 td:first-child { background-color: #ffccbc; }
.desk-color-6 td:first-child { background-color: #d7ccc8; }
.desk-color-7 td:first-child { background-color: #b3e5fc; }

.reserved {
  background-color: #ff7043;
  color: #fff;
  font-weight: bold;
  border-radius: 4px;
}
</style>
