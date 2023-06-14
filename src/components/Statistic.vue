
<script>
import Chart from "chart.js/auto";
export default {
    props: ["isExist", "isActive", "isEnd", "questionnaire"],
    data() {
        return {
            title: "",
            description: "",
            startDate: null,
            endDate: null,
            questionList: [],
            requiredQuestionsCompleted: false,
            readOnly: false,
            reportTime: "",
            reportData: [],
            reporterCount: 0,
        }
    },
    methods: {
        createPieChart() {
            const pieChartCanvas = this.$refs.pieChartCanvas;
            const pieChart = new Chart(pieChartCanvas, {
                type: 'pie',
                data: {
                    labels: ['Label 1', 'Label 2', 'Label 3'],
                    datasets: [{
                        data: [30, 40, 30],
                        backgroundColor: ['red', 'blue', 'green'],
                    }],
                },
            });
        },
        createBarChart() {
            const barChartCanvas = this.$refs.barChartCanvas;
            const barChart = new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Label 1', 'Label 2', 'Label 3'],
                    datasets: [{
                        label: 'Dataset 1',
                        data: [10, 20, 30],
                        backgroundColor: 'blue',
                    }],
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        },

    },
    beforeMount() {
        const sessionQuestionData = sessionStorage.getItem("questionData");
        if (sessionQuestionData) {
            this.questionList = JSON.parse(sessionQuestionData);
        }
        const sessionReportData = sessionStorage.getItem("reportData");
        if (sessionReportData) {
            this.reportData = JSON.parse(sessionReportData);
        }
    },
    mounted() {
        this.questionList = this.questionList.map(question => {
            return fetch("http://localhost:8080/findByQuestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(question),
            })
                .then(res => res.json())
                .then(data => {
                    return {
                        ...question,
                        optionList: data,
                        selectedOption: [],
                    };
                })
                .catch(err => {
                    console.log(err);
                    return question; // 若發生錯誤，保留原本的 question 物件
                });
        });
        Promise.all(this.questionList).then(updatedQuestions => {
            this.questionList = updatedQuestions;
            console.log(this.questionList);
            if (sessionStorage.getItem("reportList") && this.readOnly) {
                const reportList = JSON.parse(sessionStorage.getItem("reportList"));

                console.log(reportList);
                // 將報告列表放入對應的欄位
                reportList.forEach(report => {
                    const questionIndex = this.questionList.findIndex(question => question.questionId === report.question.questionId);
                    if (questionIndex !== -1) {
                        const optionIndex = this.questionList[questionIndex].optionList.findIndex(option => option.optionId === report.option.optionId);
                        if (optionIndex !== -1) {
                            if (this.questionList[questionIndex].type === 'single') {
                                this.questionList[questionIndex].selectedOption = report.option.optionId;
                            } else if (this.questionList[questionIndex].type === 'multiple') {
                                this.questionList[questionIndex].selectedOption[optionIndex] = true;
                            }
                        }
                    }
                });
            }
            if (sessionStorage.getItem("reporterData")) {
                const reporter = JSON.parse(sessionStorage.getItem("reporterData"))
                this.reporterCount = reporter.dataCount;
            }
        });
        this.createPieChart();
        this.createBarChart();
    },

}
</script>
<template>
    <div class="write">
        <div class="questionnaire-area">
            <div class="title">
                <h2>{{ questionnaire.title }}</h2>
            </div>
            <div class="description">
                <h4>{{ questionnaire.description }}</h4>
            </div>
            <div class="time">
                <p>問卷開放時間：{{ questionnaire.startDate }}~{{ questionnaire.endDate }}</p>
            </div>
        </div>

        <div class="question-area">
            <div v-for="(question, index) in questionList" :key="index">
                <ul>
                    <li v-if="question.required">{{ index + 1 }}、{{ question.title }} (必填)</li>
                    <li v-else>{{ index + 1 }}、{{ question.title }} (選填)</li>
                    <p v-for="option in question.optionList" style="margin: 12px;">
                        {{ option.optionName }}：
                        {{ ((reportData.filter(report => {
                            return report.option.optionId === option.optionId
                        }).length) / (reportData.filter(report => {
                            return report.question.questionId === question.questionId
                        }).length) * 100).toFixed(2) + '%' }}
                    </p>
                </ul>
            </div>
        </div>
        <div class="btn-area">
            <!-- <button type="button" class="btn btn-secondary" @click="cancel">返回</button> -->
        </div>
    </div>
    <canvas ref="pieChartCanvas"></canvas>
    <canvas ref="barChartCanvas"></canvas>
</template>
<style lang="scss" scoped>
.write {
    margin: 24px;
    border: 1px solid gray;
    min-width: min-content;


    .questionnaire-area {
        margin: 24px;
        border: 1px solid gray;
        text-align: center;
        position: relative;
        border-radius: 12px;
        min-width: min-content;

        .time {
            position: absolute;
            right: 0;
        }
    }

    .question-area {
        margin: 24px;
        border: 1px solid gray;
        border-radius: 12px;
        min-width: min-content;
    }

    .btn-area {
        margin: 24px;
        display: flex;
        justify-content: space-around;
    }
}
</style>