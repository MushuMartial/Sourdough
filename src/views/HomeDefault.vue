<template>
  <div class="home">
    <h1>Réservation de desks</h1>

    <div class="form-section">
      <ReservationForm @reservation-added="refreshDayView" />
    </div>

    <div class="dayview-section">
      <DayView ref="dayView" />
    </div>
  </div>
</template>

<script>
import ReservationForm from '../components/ReservationForm.vue';
import DayView from '../components/DayView.vue';

export default {
  components: { ReservationForm, DayView },
  methods: {
    refreshDayView() {
      this.$refs.dayView.fetchReservations();
    }
  }
}
</script>

<style>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

.form-section, .dayview-section {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.dayview-section {
  overflow-x: auto;
}
</style>
