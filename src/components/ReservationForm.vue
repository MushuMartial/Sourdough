<template>
  <div class="reservation-form">
    <h3>Réserver un desk</h3>
    <form @submit.prevent="submitReservation">
      <label>Nom:</label>
      <input v-model="userName" required />

      <label>Desk:</label>
      <select v-model="deskId" required>
        <option v-for="n in 8" :key="n" :value="n">Desk {{ n }}</option>
      </select>

      <label>Date:</label>
      <input type="date" v-model="date" required />

      <label>Heure de début:</label>
      <select v-model="startTime" required @change="updateEndTimeSlots">
        <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
      </select>

      <label>Heure de fin:</label>
      <select v-model="endTime" required>
        <option v-for="slot in endTimeSlots" :key="slot" :value="slot">{{ slot }}</option>
      </select>

      <button type="submit">Réserver</button>
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
    // Générer tous les créneaux de 08:00 à 18:00 par tranche de 15 min
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        let hh = h.toString().padStart(2, '0');
        let mm = m.toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    this.timeSlots = slots;
    this.endTimeSlots = slots; // initialement identiques
  },
  methods: {
    updateEndTimeSlots() {
      // Filtrer les créneaux de fin pour qu’ils soient après l’heure de début
      this.endTimeSlots = this.timeSlots.filter(slot => slot > this.startTime);
      if (!this.endTimeSlots.includes(this.endTime)) {
        this.endTime = ""; // réinitialiser si la valeur n'est plus valide
      }
    },
    async submitReservation() {
      if (!this.startTime || !this.endTime || this.startTime >= this.endTime) {
        alert("Veuillez saisir un créneau valide.");
        return;
      }

      const startDateTime = `${this.date}T${this.startTime}:00`;
      const endDateTime = `${this.date}T${this.endTime}:00`;

      // Vérification des conflits
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
        alert("Ce créneau est déjà réservé. Choisissez un autre horaire.");
        return;
      }

      console.log("Envoi de la réservation :", {
        deskId: this.deskId,
        userName: this.userName,
        startTime: startDateTime,
        endTime: endDateTime
        });

        await addDoc(collection(db, "reservations"), {
        deskId: this.deskId,
        userName: this.userName,
        startTime: startDateTime,
        endTime: endDateTime
        });

      console.log("Réservation ajoutée !");

      alert("Réservation ajoutée !");
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.reservation-form input, .reservation-form select, .reservation-form button {
  padding: 6px;
  font-size: 14px;
}
button {
  cursor: pointer;
}
</style>
