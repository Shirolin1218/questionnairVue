<script>
export default {
    data() {
        return {
            title: "",
            description: "",
            startDate: null,
            endDate: null,
            inputName: "",
            inputTelephone: "",
            inputEmail: "",
            inputAge: null,
            questionList: [],
            questionnaire: {},
            requiredQuestionsCompleted: false,
            readOnly: false,
            reportTime: "",
        }
    },
    methods: {
        test() {

        },
        goReport() {
            this.checkRequiredQuestionsCompleted();
            if (this.requiredQuestionsCompleted) {
                const reportList = []
                const reporter = {
                    name: this.inputName,
                    email: this.inputEmail,
                    phone: this.inputTelephone,
                    age: this.inputAge,
                    gender: null,
                    description: "",
                    questionnaire: this.questionnaire,
                }
                const body = {
                    reporter: reporter,
                }
                fetch("http://localhost:8080/newReporter", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }).then(res => res.json())
                    .then(data => {
                        if (data.code === "200") {
                            // 遍歷 questionList
                            for (let i = 0; i < this.questionList.length; i++) {
                                const question = this.questionList[i];
                                const selectedOptionId = question.selectedOption;

                                // 根據問題類型進行處理
                                if (question.type === 'single') {
                                    // 單選類型處理
                                    const selectedOption = question.optionList.find(option => option.optionId === selectedOptionId);
                                    // 在這裡處理選項值
                                    const report = {
                                        reporter: reporter,
                                        option: selectedOption,
                                        questionnaire: selectedOption.questionnaire,
                                        question: selectedOption.question,
                                    };
                                    console.log(report);
                                    reportList.push(report);
                                } else if (question.type === 'multiple') {
                                    // 多選類型處理
                                    const selectedOptions = question.optionList.filter((option, index) => selectedOptionId[index]);

                                    // 在這裡處理選項值
                                    const selectedOptionsData = selectedOptions.map(option => {
                                        const report = {
                                            reporter: reporter,
                                            option: option,
                                            questionnaire: option.questionnaire,
                                            question: option.question,
                                        };
                                        console.log(report);
                                        return report;
                                    });
                                    reportList.push(...selectedOptionsData);

                                } else {
                                    // 其他類型處理（例如文本區域）
                                    const enteredText = selectedOptionId;
                                    // 在這裡處理文本值
                                    console.log(`問題 ${i + 1} 的文本輸入: ${selectedOptionId}`);
                                }

                            }
                            console.log(reportList);
                            return data.code;
                        } else {
                            console.log("faild")
                            alert(data.message);
                            return data.code;
                        }

                    }).then((newReporterCode) => {
                        if (newReporterCode === "200") {
                            const reportBody = {
                                reportList: reportList
                            };
                            console.log(reportList);
                            fetch("http://localhost:8080/newReports", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(reportBody),
                            }).then(res => res.json())
                                .then(data => {
                                    console.log("newReports")
                                    if (data.message === "200") {

                                    } else {
                                        alert(data.message);
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                    })
                    .catch(err => console.log(err))
            } else {
                alert("請在必選題填入答案")
            }

        },
        checkRequiredQuestionsCompleted() {
            // 檢查每個必填問題的選擇狀態
            this.requiredQuestionsCompleted = this.questionList
                .filter(question => question.required) // 過濾出必填問題
                .every(question => {
                    if (question.type === 'single') {
                        return question.selectedOption !== null;
                    } else if (question.type === 'multiple') {
                        return question.selectedOption.length > 0;
                    } else {
                        return true; // 非選擇題視為已完成
                    }
                });
        },
        cancel() {
            if (!this.readOnly) {
                this.$router.push("/reporter")
            } else {
                this.activeTab = "questionnaire";
                this.$router.push("/manage")
            }
        }
    },
    beforeMount() {
        const sessionQuestionnaire = sessionStorage.getItem("questionnaire");
        if (sessionQuestionnaire) {
            const questionnaire = JSON.parse(sessionQuestionnaire);
            this.startDate = questionnaire.startDate;
            this.endDate = questionnaire.endDate;
            this.description = questionnaire.description;
            this.title = questionnaire.title;
            this.questionnaire = questionnaire;
        }
        const sessionQuestionData = sessionStorage.getItem("questionData");
        if (sessionQuestionData) {
            this.questionList = JSON.parse(sessionQuestionData);
        }
        const sessionReportReadonly = sessionStorage.getItem("reportReadonly");
        if (sessionReportReadonly) {
            this.readOnly = JSON.parse(sessionReportReadonly);
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
            if (sessionStorage.getItem("reporter")) {
                const reporter = JSON.parse(sessionStorage.getItem("reporter"))
                this.inputName = reporter.name;
                this.inputEmail = reporter.email;
                this.inputTelephone = reporter.phone;
                this.inputAge = reporter.age;
                this.reportTime = reporter.reportTime;
            }

        });
    },

}
</script>
<template>
    <div class="write">
        <div class="questionnaire-area">
            <div class="title">
                <h2>{{ title }}</h2>
            </div>
            <div class="description">
                <h4>{{ description }}</h4>
            </div>
            <div class="time">
                <p v-if="!readOnly">問卷開放時間：{{ startDate }}~{{ endDate }}</p>
                <p v-else>填寫時間：{{ reportTime.substring(0, 10) }}</p>
            </div>
        </div>
        <div class="reporter-info">
            <h3>填寫者資料</h3>
            <div class="area name">
                <label for="name">姓名(必填)</label>
                <input type="text" id="name" v-model="inputName" :disabled="readOnly">

            </div>
            <div class="area telephone">
                <label for="telephone">手機(必填)</label>
                <input type="text" id="telephone" v-model="inputTelephone" :disabled="readOnly">
            </div>
            <div class="area email">
                <label for="email">email(必填)</label>
                <input type="email" name="" id="email" v-model="inputEmail" :disabled="readOnly">
            </div>
            <div class="area age">
                <label for="age">年齡(必填)</label>
                <input type="number" id="age" v-model="inputAge" :disabled="readOnly">
            </div>
        </div>
        <div class="question-area">
            <div v-for="(question, index) in questionList" :key="index">
                <ul>
                    <li v-if="question.required">{{ index + 1 }}、{{ question.title }} (必填)</li>
                    <li v-else>{{ index + 1 }}、{{ question.title }} (選填)</li>
                    <label v-for="( option, optionIndex) in question.optionList" :key="option.optionId"
                        style="margin: 12px;">
                        <input type="radio" :value="option.optionId" v-if="question.type === 'single'"
                            v-model="question.selectedOption" :disabled="readOnly">
                        <input type="checkbox" :value="option.optionId" v-else-if="question.type === 'multiple'"
                            v-model="question.selectedOption[optionIndex]" :disabled="readOnly">
                        {{ option.optionName }}
                    </label>
                    <textarea name="" id="" cols="70" v-if="question.type === 'input'" :disabled="readOnly"></textarea>
                </ul>
            </div>
        </div>
        <div class="btn-area">
            <button type="button" class="btn btn-secondary" @click="cancel" v-if="!readOnly">取消</button>
            <button type="button" class="btn btn-secondary" @click="cancel" v-else>返回</button>
            <button type="button" class="btn btn-primary" @click="goReport" v-if="!readOnly">送出</button>
        </div>
    </div>
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

    .reporter-info {
        margin: 24px;
        border: 1px solid gray;
        border-radius: 12px;
        min-width: min-content;

        .area {
            margin: 32px;
        }

        label {
            width: 96px;
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