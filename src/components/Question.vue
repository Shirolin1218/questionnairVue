<script>
export default {
    props: ["isExist", "isActive", "isEnd", "questionnaire"],
    emits: ['goQuestionnaire'],
    data() {
        return {
            inputQuestion: "",
            inputOption: "",
            inputType: "single",
            isRequired: false,
            tempOptionList: [""],
            optionList: [],
            questionList: [],
            selectedQuestionList: [],
        }
    },
    methods: {
        newQuestion() {
            if (!this.inputQuestion) {
                alert("請輸入題目標題");
                return;
            }
            if (this.questionList.some(question => question.title === this.inputQuestion)) {
                alert("題目重複");
                return;
            }
            const question = {
                questionnaire: JSON.parse(sessionStorage.getItem("questionnaire")),
                title: this.inputQuestion,
                type: this.inputType,
                required: this.isRequired,
            }
            this.questionList.push(question)

            this.tempOptionList.forEach(optionName => {
                if (optionName) {
                    const option = {
                        questionnaire: JSON.parse(sessionStorage.getItem("questionnaire")),
                        question: {
                            title: this.inputQuestion
                        },
                        optionName: optionName
                    }
                    this.optionList.push(option);
                }
            })
            this.tempOptionList = [""];
            this.inputQuestion = ""
        },
        updateOption(index, value) {
            this.tempOptionList[index] = value;
            if (!this.tempOptionList[index]) {
                this.tempOptionList.splice(index, 1)
            }
            if (!this.tempOptionList.includes("")) {
                this.tempOptionList.push("");
            }
        },
        submitRequest() {
            const body = {
                questionList: this.questionList
            }
            console.log(body);
            fetch("http://localhost:8080/newQuestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.code === "200") {
                        sessionStorage.setItem("questionList", JSON.stringify(this.questionList));
                        const optionBody = {
                            optionList: this.optionList
                        }
                        console.log(optionBody)
                        fetch("http://localhost:8080/newOption", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(optionBody),
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.message === "200") {
                                    alert(data.message)
                                } else {
                                    alert(data.message)
                                }
                            }).catch(err => alert(err))
                    } else {
                        alert(data.message)
                        this.$router.push("/");
                    }
                })
        },
        editQuestion(question, index) {
            console.log(question)
            console.log(index)
            fetch("http://localhost:8080/findByQuestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(question),
            }).then(res => res.json())
                .then(data => {
                    console.log(data);
                    this.optionList = data;
                    this.inputQuestion = question.title;
                    this.inputType = question.type;
                    this.isRequired = question.required
                    this.tempOptionList = data.map(option => option.optionName);
                }).catch(err => alert(err))
        },
        delTempOption() {
            console.log("del!")
            if (confirm("確定要刪除選取的項目嗎？")) {
                const body = {
                    questionList: this.selectedQuestionList
                }
                fetch("http://localhost:8080/delQuestion", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }).then(res => res.json())
                    .then(data => {
                        this.selectedQuestionList.forEach(question => {
                            this.questionList.splice(this.questionList.indexOf(question), 1);
                        })
                        this.selectedQuestionList = [];
                        sessionStorage.setItem("questionList", JSON.stringify(this.questionList))
                    });
                // 清空 selectedQuestions 陣列

            }
        },
        cancel() {
            this.$router.push("/")
        },
        checkType(inputType) {
            if (inputType === "input") {
                this.tempOptionList = [""];
            }
        },
        test(){
            console.log(this.questionnaire)
        }
    },
    created() {
        if (sessionStorage.getItem("questionList")) {
            this.questionList = JSON.parse(sessionStorage.getItem("questionList"));
        }
    },
}
</script>
<template>
    <div class="question">
        <form>
            <div class="row mb-3">
                <label for="input-questionnaire" class="col-sm-2 col-form-label">問卷標題</label>
                <input type="text" class="form-control" id="input-questionnaire" disabled="true" :value="questionnaire.title"
                    placeholder="請選取或新增一個問卷">
            </div>
            <div class="row mb-3">
                <label for="input-question" class="col-sm-1 col-form-label">問題</label>
                <div class="col-sm-10 question-input-area">
                    <input type="text" class="form-control" id="input-question" v-model="inputQuestion" placeholder="請輸入問題"
                        :disabled="isActive">
                    <select name="" id="" v-model="inputType" :disabled="isActive" @input="checkType(inputType)">
                        <option value="single">單選</option>
                        <option value="multiple">多選</option>
                        <option value="input">文字</option>
                    </select>
                    <label for="require">必填</label>
                    <input type="checkbox" id="require" v-model="isRequired" :disabled="isActive">
                    <button type="button" class="btn btn-primary new-question" @click="newQuestion"
                        v-if="!isActive">加入</button>
                </div>
            </div>
            <div class="mb-3 option-area" :aria-disabled="inputType !== 'input'">
                <label>選項</label>
                <div class="options">
                    <input type="text" class="input-option" placeholder="請輸入選項" v-for="(option, index) in tempOptionList"
                        :value="option" @input="updateOption(index, $event.target.value)" :disabled="isActive"
                        v-if="inputType !== 'input'">
                </div>
            </div>
            <div class="question-area">
                <i class="del-icon fa-solid fa-trash-can fa-xl" @click="delTempOption" v-if="!isActive"></i>
                <div class="row row-header">
                    <div class="col check"> </div>
                    <div class="col number"># </div>
                    <div class="col title">問題 </div>
                    <div class="col type">種類 </div>
                    <div class="col require">必填 </div>
                    <div class="col edit"> </div>
                </div>
                <div class="row row-body" v-for=" (question, index) in questionList">
                    <div class="col check">
                        <input type="checkbox" class="selected-question" v-model="selectedQuestionList" :value="question"
                            :disabled="isActive">
                    </div>
                    <div class="col number"> {{ index + 1 }}</div>
                    <div class="col title">{{ question.title }}</div>
                    <div class="col type"> {{ question.type }}</div>
                    <div class="col require">
                        <input type="checkbox" v-model="question.required" :disabled="isActive">
                    </div>
                    <div class="col edit">
                        <button type="button" @click="editQuestion(question, index)" v-if="!isActive">編輯</button>
                        <button type="button" @click="editQuestion(question, index)" v-else>查看</button>
                    </div>
                </div>
            </div>
            <div class="btn-area" v-if="!isActive">
                <button type="submit" class="btn btn-secondary" @click="cancel" :disabled="isActive">取消</button>
                <button type="button" class="btn btn-primary " @click="submitRequest" :disabled="isActive">送出</button>
            </div>
        </form>
    </div>
</template>
<style lang="scss" scoped>
.question {
    border: 1px solid black;
    padding: 16px;
    width: 768px;
    height: 516px;

    .question-input-area {
        position: relative;

        .new-question {
            position: absolute;
            right: 0;
            top: 32px;
        }
    }

    .form-control {
        display: inline;
        width: 50%;
    }

    .option-area {
        height: 64px;

        .input-option {
            width: 96px;
            margin: 0 12px;
        }
    }

    .question-area {
        margin-top: 32px;
        border: 1px black solid;
        position: relative;

        .del-icon {
            position: absolute;
            top: -16px;
            left: -12px;
            cursor: pointer;
        }

        .row-header {
            border-bottom: 1px black solid;
        }

        .row {
            width: 100%;
            margin: 0;

            .col {
                border-right: 1px black solid;
            }

            .check {
                max-width: 32px;
            }

            .number {
                max-width: 48px;
            }

            .title {
                min-width: 256px;
            }

            .type {
                max-width: 84px;
            }

            .require {
                max-width: 64px;
            }

            .edit {
                max-width: 84px;
            }
        }
    }

    .btn-area {
        margin-top: 32px;
    }
}
</style>