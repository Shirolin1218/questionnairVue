<script>
export default {
  data() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      title: "",
      inputStartDate: today.toISOString().split("T")[0],
      inputEndDate: nextWeek.toISOString().split("T")[0],
      today: today,
      questionnaireList: [],
      page: [],
      selectedIndex: null,
      searchCondition: {
        title: "",
        startDate: null,
        endDate: null,
        isActive: false,
      },
      questionnaire: {},
    }
  },
  methods: {
    newQuestionnaire() {
      sessionStorage.removeItem("questionnaire")
      this.$router.push("/manage")
    },
    setCondition(title, inputStartDate, inputEndDate) {
      //設定搜尋條件
      this.searchCondition.title = title;
      this.searchCondition.startDate = inputStartDate;
      this.searchCondition.endDate = inputEndDate;
      this.searchCondition.isActive = true;
      this.searchData(0);
    },
    searchData(index) {
      const body = {
        questionnaire: this.searchCondition,
        page: index,
      }
      fetch("http://localhost:8080/searchQuestionnaires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      }).then(res => res.json())
        .then(data => {
          console.log(data)
          if (data && data.code === "200") {
            this.questionnaireList = data.questionnaireList;
            this.page = []
            //根據資料筆數除以10以生成頁數的陣列
            for (let i = 0; i < data.dataCount / 10; i++) {
              this.page.push(i)
            }
            this.selectedIndex = index;
            console.log(this.page);
          }
        })

    },
    getByTitle(title) {
      fetch("http://localhost:8080/findByTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: title,
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === "200") {
            this.questionnaire = data.questionnaire;
            console.log(this.questionnaire);
            sessionStorage.setItem("questionnaire", JSON.stringify(data.questionnaire));
          } else {
            alert(data.message)
          }
        })
        .then(() => {
          const reporterBody = {
            questionnaire: this.questionnaire,
            page: 0
          };

          const fetchQuestionData = fetch("http://localhost:8080/findQuestionsByQuestionnaire", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.questionnaire)
          })
            .then(res => res.json())
            .then(data => {
              sessionStorage.setItem("questionData", JSON.stringify(data));
            })
            .catch(err => alert(err));

          const fetchReporterData = fetch("http://localhost:8080/findReportersByQuestionnaire", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reporterBody)
          })
            .then(res => res.json())
            .then(data => {
              console.log(data);
              sessionStorage.setItem("reporterData", JSON.stringify(data));
            })
            .catch(err => alert(err));

          Promise.all([fetchQuestionData, fetchReporterData])
            .then(() => {
              this.$router.push("/manage");
            });
        });
    },
    changePage(index) {
      if (!this.searchCondition.isActive) {
        fetch("http://localhost:8080/findQuestionnairesPage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: index
        }).then(res => res.json())
          .then(data => {
            console.log(data)
            this.questionnaireList = data;
            this.selectedIndex = index;
          })
      } else {
        this.searchData(index);
      }
    },
    backPage() {
      if (this.selectedIndex > 0) {
        this.changePage(this.selectedIndex - 1)

      }
    },
    nextPage() {
      if (this.selectedIndex < this.page.length) {
        this.changePage(this.selectedIndex + 1)
      }
    },
    checkStart() {
      console.log("check")
      if (new Date(this.inputStartDate) > new Date(this.inputEndDate)) {
        this.inputEndDate = null;
      }
    },
    checkEnd() {
      console.log("check")
      if (new Date(this.inputStartDate) > new Date(this.inputEndDate)) {
        this.inputStartDate = null;
      }
    },
    goReport() {
      this.$router.push("/reporter");
    }
  },
  mounted() {
    fetch("http://localhost:8080/getHowManyData", {
    }).then(res => res.json())
      .then(data => {
        if (data && data.code === "200") {
          console.log(data);
          this.questionnaireList = data.questionnaireList;
          //根據資料筆數除以10以生成頁數的陣列
          for (let i = 0; i < data.dataCount / 10; i++) {
            this.page.push(i)
          }
          this.selectedIndex = 0;
          console.log(this.page);
        }
      })
    console.log(this.inputStartDate)
  },
}
</script>

<template>
  <div class="home">
    <div class="search-area">
      <div class="search title">
        <label for="title">標題</label>
        <input type="text" name="title" id="title" v-model="title">
      </div>
      <div class="search date">
        <label for="start-date">開始日期</label>
        <input type="date" name="start-date" id="start-date" v-model="inputStartDate" @input="checkStart">
        <label for="end-date">結束日期</label>
        <input type="date" name="end-date" id="end-date" v-model="inputEndDate" @input="checkEnd">
      </div>
      <button type="submit" class="btn btn-primary"
        @click="setCondition(title, inputStartDate, inputEndDate)">search</button>
    </div>
    <button type="submit" class="btn btn-primary" @click="newQuestionnaire">新增問卷</button>
    <div class="questionnaire-area">
      <div class="row row-header">
        <div class="col check"> </div>
        <div class="col number"># </div>
        <div class="col head-title ">問卷標題 </div>
        <div class="col status">狀態 </div>
        <div class="col start">開始日期 </div>
        <div class="col end">結束日期 </div>
        <div class="col report"> 統計 </div>
      </div>
      <div class="row" v-for="(questionnaire, index) in questionnaireList">
        <div class="col check"> <input type="checkbox" :id="questionnaire.questionnaireId"> </div>
        <div class="col number"> {{ questionnaire.questionnaireId }} </div>
        <div class="col title" @click="getByTitle(questionnaire.title)"> {{ questionnaire.title }}</div>
        <div class="col status">
          <span
            v-if="new Date(questionnaire.startDate) < today &&
              new Date(questionnaire.startDate) < new Date(questionnaire.endDate) && new Date(questionnaire.endDate) > today">
            進行中</span>
          <span v-else-if="new Date(questionnaire.endDate) < today">已結束</span>
          <span v-else-if="new Date(questionnaire.startDate) > today">未開始</span>
        </div>
        <div class="col start"> {{ questionnaire.startDate.substring(0, 10) }} </div>
        <div class="col end"> {{ questionnaire.endDate.substring(0, 10) }} </div>
        <div class="col report"> report未完成 </div>
      </div>
    </div>
    <div class="page-area">
      <button class="page-btn page" @click="backPage" v-if="selectedIndex > 0">&#60;</button>
      <button class="page-btn page" v-for="(p, index) in page" @click="changePage(index)"
        :class="{ 'selected': selectedIndex === index }">{{ p + 1 }}</button>
      <button class="page-btn page" @click="nextPage" v-if="selectedIndex + 1 < page.length">&#62;</button>
    </div>
    <button @click="goReport">test</button>
  </div>
</template>
<style lang="scss" scoped>
.home {
  margin: 48px;
}

.search-area {
  border: 1px black solid;
  border-radius: 12px;
  height: 168px;
  min-width: 912px;
}

.questionnaire-area {
  margin-top: 48px;
  border: 1px black solid;
  min-width: 912px;
  height: 268px;

  .row-header {
    border-bottom: 1px black solid;
  }

  .row {
    width: 100%;
    margin: 0;


    &:nth-child(even) {
      background-color: aliceblue;
    }

    .col {
      border-right: 1px black solid;
    }

    .check {
      max-width: 32px;
    }

    .number {
      max-width: 64px;
    }

    .head-title {
      min-width: 256px;
    }

    .title {
      min-width: 256px;
      cursor: pointer;

      &:hover {
        color: white;
        background-color: cornflowerblue
      }
    }

    .status {
      max-width: 84px;
    }

    .start {
      min-width: 128px;
    }

    .end {
      min-width: 128px;
    }

    .report {
      min-width: 128px;
      border: none;
    }
  }


}

.page-area {
  display: flex;
  justify-content: center;

  .page-btn {
    text-align: center;
    padding: 0;
    background: none;
    border: none;
    border-bottom: 1px solid blue;
    color: blue;
    margin: 8px 8px;
  }

  .selected {
    color: black;
    border: none;
    pointer-events: none;
  }
}
</style>