<script>
export default {
  data() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      localStartDate: today.toISOString().split("T")[0],
      localEndDate: nextWeek.toISOString().split("T")[0],
      today: today,
      questionnaireList: [],
      page: [],
      selectedIndex: null,
    }
  },
  methods: {
    getData() {
      //依條件進行搜尋的方法
    },
    goQuestionnaire(title) {
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
            sessionStorage.setItem("questionnaire", JSON.stringify(data.questionnaire));
          } else {
            alert(data.message);
          }
        }).then(() => {
          fetch("http://localhost:8080/findQuestionsByQuestionnaire", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: sessionStorage.getItem("questionnaire")
          }).then(res => res.json())
            .then(data => {
              sessionStorage.setItem("questionData", JSON.stringify(data));
              sessionStorage.setItem("reportReadonly", false);
              this.$router.push("/write");
            }).catch(err => alert(err))
        })
    },
    changePage(index) {

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
    console.log(this.localStartDate)
  },
}
</script>

<template>
  <div class="home">
    <div class="search-area">
      <div class="search title">
        <label for="title">標題</label>
        <input type="text" name="title" id="title">
      </div>
      <div class="search date">
        <label for="start-date">開始日期</label>
        <input type="date" name="start-date" id="start-date" v-model="localStartDate">
        <label for="end-date">結束日期</label>
        <input type="date" name="end-date" id="end-date" v-model="localEndDate">
      </div>
      <button type="submit" class="btn btn-primary" @click="getData">search</button>
    </div>
    <div class="questionnaire-area">
      <div class="row row-header">
        <div class="col number"># </div>
        <div class="col head-title ">問卷標題 </div>
        <div class="col status">狀態 </div>
        <div class="col start">開始日期 </div>
        <div class="col end">結束日期 </div>
        <div class="col report"> 統計 </div>
      </div>
      <div class="row" v-for="(questionnaire, index) in questionnaireList" :class="{
        'no-click': !(new Date(questionnaire.startDate) < today && today < new Date(questionnaire.endDate))
      }">
        <div class="col number"> {{ questionnaire.questionnaireId }} </div>
        <div class="col title" @click="goQuestionnaire(questionnaire.title)">
          {{ questionnaire.title }}
        </div>
        <div class="col status">
          <span v-if="new Date(questionnaire.startDate) < today &&
            today < new Date(questionnaire.endDate)">
            進行中</span>
          <span v-else-if="new Date(questionnaire.endDate) < today">已結束</span>
          <span v-else-if="new Date(questionnaire.startDate) > today">未開始</span>
        </div>
        <div class="col start"> {{ questionnaire.startDate.substring(0, 10) }} </div>
        <div class="col end"> {{ questionnaire.endDate.substring(0, 10) }} </div>
        <div class="col report"> report </div>
      </div>
    </div>
    <div class="page-area">
      <button class="page-btn page" @click="backPage" v-if="selectedIndex > 0">&#60;</button>
      <button class="page-btn page" v-for="(p, index) in page" @click="changePage(index)"
        :class="{ 'selected': selectedIndex === index }">{{ p + 1 }}</button>
      <button class="page-btn page" @click="nextPage" v-if="selectedIndex + 1 < page.length">&#62;</button>
    </div>
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
  min-width: 768px;
}

.questionnaire-area {
  margin-top: 48px;
  border: 1px black solid;
  min-width: 768px;
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
      border: none;
    }
  }

  .no-click {
    pointer-events: none;
    opacity: 0.7;
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