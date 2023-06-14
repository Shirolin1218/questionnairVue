<script>
import Chart from 'chart.js/auto';


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
            statisticType: "text",
        }
    },
    methods: {

        changeChart() {
            if (this.statisticType === "text") {
                this.statisticType = "pie";
                this.questionList.forEach((question, index) => {
                    const canvas = document.getElementById('chartPie' + index)
                    const chartInstance = Chart.getChart(canvas); // 取得原本的圖表實例
                    if (chartInstance) {
                        chartInstance.destroy(); // 移除原本的圖表
                    }
                    // 創建圖表
                    new Chart(canvas, {
                        type: 'pie',
                        data: {
                            labels: question.optionList.map(option => option.optionName),
                            datasets: [
                                {
                                    label: 'Data',
                                    data: question.optionList.map(option => {
                                        return this.reportData.filter(report => {
                                            return report.option.optionId === option.optionId
                                        }).length
                                    }),
                                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                                    borderWidth: 1,
                                    borderWidth: 1,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            aspectRatio: 1
                        }
                    });
                })
                return;
            }
            if (this.statisticType === "pie") {
                this.statisticType = "bar";
                this.questionList.forEach((question, index) => {
                    const canvas = document.getElementById('chart' + index)
                    const chartInstance = Chart.getChart(canvas); // 取得原本的圖表實例
                    if (chartInstance) {
                        chartInstance.destroy(); // 移除原本的圖表
                    }
                    // 創建圖表
                    new Chart(canvas, {
                        type: 'bar',
                        data: {
                            labels: question.optionList.map(option => option.optionName),
                            datasets: [
                                {
                                    label: '回答數',
                                    data: question.optionList.map(option => {
                                        return this.reportData.filter(report => {
                                            return report.option.optionId === option.optionId
                                        }).length
                                    }),
                                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                                    borderWidth: 1,
                                },
                            ],
                        },
                        options: {
                            indexAxis: 'y', // 設置為 'y' 以生成水平條形圖
                            scales: {
                                x: {
                                    beginAtZero: true
                                },
                                y: {
                                    beginAtZero: true
                                }
                            }
                        },
                    });
                })
                return;
            }
            if (this.statisticType === "bar") {
                this.statisticType = "text";
                return;
            }
        },

    },
    created() {
        const sessionQuestionData = sessionStorage.getItem("questionData");
        if (sessionQuestionData) {
            this.questionList = JSON.parse(sessionQuestionData);
        }
        const sessionReportData = sessionStorage.getItem("reportData");
        if (sessionReportData) {
            this.reportData = JSON.parse(sessionReportData);
        }
    },
    beforeMount() {
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

            if (sessionStorage.getItem("reporterData")) {
                const reporter = JSON.parse(sessionStorage.getItem("reporterData"))
                this.reporterCount = reporter.dataCount;
            }
        });

    },



}
</script>
<template>
    <div class="statistic">
        <div class="questionnaire-area">
            <div class="title">
                <h2>{{ questionnaire.title }}</h2>
            </div>
            <div class="description">
                <h4>{{ questionnaire.description }}</h4>
            </div>
            <button type="button" @click="changeChart">change</button>
            <div class="time">
                <p>問卷開放時間：{{ questionnaire.startDate }}~{{ questionnaire.endDate }}</p>
            </div>
        </div>

        <div class="question-area">
            <div v-for="(question, index) in questionList" :key="index" class="question">
                <ul>
                    <li v-if="question.required">{{ index + 1 }}、{{ question.title }} (必填)</li>
                    <li v-else>{{ index + 1 }}、{{ question.title }} (選填)</li>
                    <p v-for="option in question.optionList" style="margin: 12px;" v-show="statisticType === 'text'">
                        {{ option.optionName }}：
                        {{ ((reportData.filter(report => {
                            return report.option.optionId === option.optionId
                        }).length) / (reportData.filter(report => {
                            return report.question.questionId === question.questionId
                        }).length) * 100).toFixed(2) + '%' }}
                    </p>
                    <canvas :id="'chart' + index" style="width: 128px; max-height: 256px;"
                        v-show="statisticType === 'bar'"></canvas>
                    <canvas :id="'chartPie' + index" style="width: 128px; max-height: 256px;"
                        v-show="statisticType === 'pie'"></canvas>
                </ul>
            </div>
        </div>
        <div class="btn-area">
            <!-- <button type="button" class="btn btn-secondary" @click="cancel">返回</button> -->
        </div>
    </div>
</template>
<style lang="scss" scoped>
.statistic {
    margin: 24px;
    border: 1px solid gray;
    max-width: 100vw;




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