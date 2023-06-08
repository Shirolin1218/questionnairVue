<script>
export default {
    props: ["localStartDate", "localEndDate", "title", "description", "isExist", "isActive", "isEnd"],
    data() {
        return {
            inputStartDate: this.localStartDate,
            inputEndDate: this.localEndDate,
            inputTitle: this.title,
            inputDescription: this.description,
        }
    },
    methods: {
        newData() {
            const body = {
                "questionnaire": {
                    title: this.inputTitle,
                    startDate: this.inputStartDate,
                    endDate: this.inputEndDate,
                    description: this.inputDescription
                },
            }
            fetch("http://localhost:8080/newQuestionnaire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.code === "200") {
                        alert(data.message);
                        sessionStorage.setItem("questionnaire", JSON.stringify(data.questionnaire));
                        this.refreshInput();
                        this.$emit("newQuestionnaire", data.questionnaire);
                        sessionStorage.removeItem("questionList");
                        this.$emit("goQuestion", "question");
                    } else {
                        alert(data.message)
                    }
                })
        },
        updateData() {
            const questionnaire = JSON.parse(sessionStorage.getItem("questionnaire"));
            questionnaire.startDate = this.inputStartDate
            questionnaire.endDate = this.inputEndDate
            questionnaire.description = this.inputDescription
            const body = {
                "questionnaire": questionnaire
            }
            fetch("http://localhost:8080/updateQuestionnaire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.code === "200") {
                        alert(data.message);
                        this.$emit("goQuestion", "question");
                    } else {
                        alert(data.message)
                    }
                })
        },
        cancel() {
            this.$router.push("/")
        },
        refreshInput() {
            const questionnaire = JSON.parse(sessionStorage.getItem("questionnaire"))
            if (questionnaire) {
                this.inputStartDate = questionnaire.startDate;
                this.inputEndDate = questionnaire.endDate;
                this.inputTitle = questionnaire.title;
                this.inputDescription = questionnaire.description;
            }

        }
    },
    mounted() {
        this.refreshInput();
    },
}
</script>
<template>
    <div class="questionnaire">
        <form>
            <div class="row mb-3">
                <label for="input-title" class="col-sm-2 col-form-label">問卷標題</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="input-title" v-model="inputTitle" placeholder="請輸入標題"
                        :disabled="isExist || isEnd">
                </div>
            </div>
            <div class="row mb-3">
                <label for="input-description" class="col-sm-2 col-form-label">描述內容</label>
                <div class="col-sm-10">
                    <textarea type="text" class="form-control" id="input-description" v-model="inputDescription"
                        placeholder="問卷描述..." :disabled="isEnd"></textarea>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-sm-10 input-date">
                    <label for="input-start-time" class="col-sm-2 col-form-label">開始時間</label>
                    <input type="date" class="form-control" id="input-start-time" v-model="inputStartDate"
                        :disabled="isActive">
                    <label for="input-end-time" class="col-sm-2 col-form-label">結束時間</label>
                    <input type="date" class="form-control" id="input-end-time" v-model="inputEndDate" :disabled="isEnd">
                </div>
            </div>
            <div class="btn-area">
                <button type="submit" class="btn btn-secondary" @click="cancel" v-if="!isEnd">取消</button>
                <button type="button" class="btn btn-primary" @click="updateData" v-if="isExist && !isEnd">更新</button>
                <button type="button" class="btn btn-primary" @click="newData" v-else v-if="!isEnd">新增</button>
            </div>
        </form>
    </div>
</template>
<style lang="scss" scoped>
.questionnaire {

    border: 1px solid black;
    padding: 16px;
    width: 768px;
    height: 516px;

    #input-description {
        height: 96px;
        max-height: 300px;
    }

    .input-date {
        display: flex;
        justify-content: space-between;
    }

    .btn-area {
        display: flex;
        justify-content: space-around
    }
}
</style>