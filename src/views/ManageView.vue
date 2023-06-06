<script>
import Questionnaire from '../components/Questionnaire.vue';
import Question from '../components/Question.vue';
export default {
    components: { Questionnaire, Question, },
    data() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return {
            questionnaire: {},
            activeTab: 'questionnaire',
            localStartDate: today.toISOString().split("T")[0],
            localEndDate: nextWeek.toISOString().split("T")[0],
            title: "",
            description: "",
            isExist: false,
            isActive: false,
            isEnd: false,
        }
    },
    methods: {
        changeTab(tab) {
            console.log("進行tab");
            this.activeTab = tab;
        },
    },
    beforeMount() {
        const sessionQuestionnaire = sessionStorage.getItem("questionnaire");
        if (sessionQuestionnaire) {
            const questionnaire = JSON.parse(sessionQuestionnaire);
            this.localStartDate = questionnaire.startDate;
            this.localEndDate = questionnaire.endDate;
            this.description = questionnaire.description;
            this.title = questionnaire.title;
            this.isExist = true;
            this.isActive = new Date(questionnaire.startDate) < new Date();
            this.isEnd = new Date(questionnaire.endDate) < new Date() && new Date(questionnaire.startDate) < new Date();
            this.questionnaire = questionnaire;
        }
    },
}
</script>
<template>
    <div class="manage">
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'questionnaire' }"
                    @click="activeTab = 'questionnaire'">問卷</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'question' }" @click="activeTab = 'question'">題目</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'report' }" @click="activeTab = 'report'">問卷回饋</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'statistic' }" @click="activeTab = 'statistic'">統計</a>
            </li>
            <li class="nav-item">
                <p class="nav-link" @click="() => this.$router.push('/')">返回</p>
            </li>
        </ul>

        <div class="tab-content">
            <div v-show="activeTab === 'questionnaire'">
                <Questionnaire @goQuestion="changeTab" :localStartDate="localStartDate" :localEndDate="localEndDate"
                    :title="title" :description="description" :isExist="isExist" :isActive="isActive" :isEnd="isEnd">
                </Questionnaire>
            </div>
            <div v-show="activeTab === 'question'">
                <Question @goQuestionnaire="changeTab" :isExist="isExist" :isActive="isActive" :isEnd="isEnd"
                    :questionnaire="questionnaire">
                </Question>
            </div>
            <div v-show="activeTab === 'report'">
                問卷回饋的內容
            </div>
            <div v-show="activeTab === 'statistic'">
                統計的內容
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.manage {
    margin: 32px;

    .nav-tabs {
        min-width: 768px;
    }
}
</style>