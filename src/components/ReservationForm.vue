<template>
  <div class="reservation-form">
    <form @submit.prevent="submitReservation">
      <div class="form-row">
        <div class="form-field">
          <label>Name:</label>
          <input v-model="userName" required />
        </div>

        <div class="form-field">
          <label>Desk:</label>
          <select v-model="deskId" required>
            <option v-for="n in 8" :key="n" :value="n">Desk {{ n }}</option>
          </select>
        </div>

        <div class="form-field">
          <label>Date:</label>
          <input type="date" v-model="date" required />
        </div>

        <div class="form-field">
          <label>Begin:</label>
          <select v-model="startTime" required @change="updateEndTimeSlots">
            <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>

        <div class="form-field">
          <label>End:</label>
          <select v-model="endTime" required>
            <option v-for="slot in endTimeSlots" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>

        <button type="submit">Reserve</button>
      </div>
    </form>
  </div>
</template>

<script>
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default {
  data() {
    return {
      userName: "",
      deskId: 1,
      date: "",
      startTime: "",
      endTime: "",
      timeSlots: [],
      endTimeSlots: []
    };
  },
  created() {
    const slots = [];
    for (let h = 8; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        slots.push(`${hh}:${mm}`);
      }
    }
    this.timeSlots = slots;
    this.endTimeSlots = slots;
  },
  methods: {
    updateEndTimeSlots() {
      this.endTimeSlots = this.timeSlots.filter(slot => slot > this.startTime);
      if (!this.endTimeSlots.includes(this.endTime)) {
        this.endTime = "";
      }
    },
    async submitReservation() {
      if (!this.startTime || !this.endTime || this.startTime >= this.endTime) {
        alert("Please choose a valid time slot.");
        return;
      }

      const startDateTime = `${this.date}T${this.startTime}:00`;
      const endDateTime = `${this.date}T${this.endTime}:00`;

      const q = query(collection(db, "reservations"), where("deskId", "==", this.deskId));
      const snapshot = await getDocs(q);
      const existing = snapshot.docs
        .map(doc => doc.data())
        .filter(r => r.startTime.startsWith(this.date));

      const conflict = existing.some(r => {
        const rStart = new Date(r.startTime);
        const rEnd = new Date(r.endTime);
        const newStart = new Date(startDateTime);
        const newEnd = new Date(endDateTime);
        return newStart < rEnd && newEnd > rStart;
      });

      if (conflict) {
        alert("This slot is already reserved. Please choose another time slot.");
        return;
      }

      await addDoc(collection(db, "reservations"), {
        deskId: this.deskId,
        userName: this.userName,
        startTime: startDateTime,
        endTime: endDateTime
      });

      alert("Reservation added!");
      this.userName = "";
      this.deskId = 1;
      this.date = "";
      this.startTime = "";
      this.endTime = "";
      this.endTimeSlots = this.timeSlots;

      this.$emit("reservation-added");
    }
  }
};
</script>

<style>
.reservation-form {
  width: 1200px;
  margin: 40px auto;
  padding: 24px 32px;
  border-radius: 18px;
  background-color: #fafafa;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  margin-bottom: 10px; /* espace personnalisé avec DayView */
}

.reservation-form h3 {
  margin-bottom: 10px;
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  color: #222;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  justify-content: center;
}

.form-field {
  display: flex;
  flex-direction: column;
  min-width: 140px;
  flex: 1;
}

.form-field label {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.form-field input,
.form-field select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

button {
  padding: 12px 24px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-end;
  transition: background-color 0.2s, transform 0.1s;
}

button:hover {
  background-color: #0062d6;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
