<script>
import Statistic from '../components/Statistic.vue';
export default {
    components: { Statistic },
    data() {
        return {
            isExist: false,
            isActive: false,
            isEnd: false,
            questionnaire: {},
        }
    },
    mounted() {
        const sessionQuestionnaire = sessionStorage.getItem("questionnaire");
        if (sessionQuestionnaire) {
            const questionnaire = JSON.parse(sessionQuestionnaire);
            this.isExist = true;
            this.isActive = new Date(questionnaire.startDate) < new Date();
            this.isEnd = new Date(questionnaire.endDate) < new Date() && new Date(questionnaire.startDate) < new Date();
            this.questionnaire = questionnaire;
        }
    },

}
</script>
<template>
    <div>
        <Statistic :isExist="isExist" :isActive="isActive" :isEnd="isEnd" :questionnaire="questionnaire">
        </Statistic>
    </div>
</template>
<style lang="scss" scoped></style>