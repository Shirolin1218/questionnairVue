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
        }
    },
    methods: {

        test(question) {
            console.log(question)
        },
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
        const sessionQuestionList = sessionStorage.getItem("questionList")
        if (sessionQuestionList) {
            this.questionList = JSON.parse(sessionQuestionList);
        }
    },
    mounted() {
        if (this.questionList) {
            //用所有的題目去對取得選項該題目的選項
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
                            selectedOption: null,
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
            });
        }
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
                <p>問卷開放時間：{{ startDate }}~{{ endDate }}</p>
            </div>
        </div>
        <div class="reporter-info">
            <h3>填寫者資料</h3>
            <div class="area name">
                <label for="name">姓名</label>
                <input type="text" id="name" v-model="inputName">

            </div>
            <div class="area telephone">
                <label for="telephone">手機</label>
                <input type="text" id="telephone" v-model="inputTelephone">
            </div>
            <div class="area email">
                <label for="email">email</label>
                <input type="email" name="" id="email" v-model="inputEmail">
            </div>
            <div class="area age">
                <label for="age">年齡</label>
                <input type="number" id="age" v-model="inputAge">
            </div>
        </div>
        <div class="question-area">
            <div v-for="(question, index) in questionList" :key="index">
                <ul>
                    <li>{{ index + 1 }}、{{ question.title }} </li>
                    <label v-for="option in question.optionList" :key="option.optionId" style="margin: 12px;" v-if="question.type === 'single'">
                        <input type="radio" :value="option.optionId" v-model="question.selectedOption">
                        {{ option.optionName }}
                    </label>
                    <label v-for="option in (question.optionList)" style="margin: 12px;"
                        v-else-if="question.type === 'multiple'">
                        <input type="checkbox" :value="option.optionId"  v-model="question.selectedOption">
                        {{ option.optionName }}
                    </label>
                    <label v-else-if="question.type === 'input'">
                        <textarea type="text"> </textarea>
                    </label>
                </ul>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.write {
    margin: 24px;
    border: 1px solid gray;


    .questionnaire-area {
        margin: 24px;
        border: 1px solid gray;
        text-align: center;
        position: relative;
        border-radius: 12px;

        .time {
            position: absolute;
            right: 0;
        }
    }

    .reporter-info {
        margin: 24px;
        border: 1px solid gray;
        border-radius: 12px;

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
    }
}
</style>