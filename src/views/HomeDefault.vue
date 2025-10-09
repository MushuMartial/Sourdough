<template>
  <div class="home">
    <h1>Desk Reservation</h1>

    <ReservationForm @reservation-added="refreshDayView" />

    <DayView ref="dayView" />
  </div>
</template>

<script>
import ReservationForm from "../components/ReservationForm.vue";
import DayView from "../components/DayView.vue";

export default {
  components: { ReservationForm, DayView },
  methods: {
    refreshDayView() {
      if (this.$refs.dayView && this.$refs.dayView.fetchReservations) {
        this.$refs.dayView.fetchReservations();
      }
    },
  },
};
</script>

<style>
.home {
  max-width: 1500px;
  margin: 0 auto;
  padding: 40px 24px;
  background-color: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
  display: flex;
  flex-direction: column;
  gap: 30px; /* espace entre formulaire et dayview */
  min-height: 100vh;
}

h1 {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1c1c1e;
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .home {
    padding: 24px 12px;
    gap: 12px;
  }

  h1 {
    font-size: 1.6rem;
  }
}
</style>
