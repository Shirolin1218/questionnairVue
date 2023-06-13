<script>
export default {
    props: ["isExist", "isActive", "isEnd", "questionnaire"],
    data() {
        return {
            reporterData: {},
            reporterList: [],
            reportList: [],
            page: [],
            selectedIndex: null,
        }
    },
    methods: {
        changePage(index) {
            const body = {
                questionnaire: this.questionnaire,
                page: index,
            };
            fetch("http://localhost:8080/findReportersByQuestionnaire", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            }).then(res => res.json())
                .then(data => {
                    console.log(data)
                    this.reporterList = data.reporterList;
                    this.selectedIndex = index;
                }).catch(err => { console.log(err) })
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
        seeReport(reporter) {
            console.log(reporter)
            fetch("http://localhost:8080/findReportsByReporter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reporter)
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    this.reportList = data;
                    sessionStorage.setItem("reportReadonly", true);
                    sessionStorage.setItem("reportList", JSON.stringify(data));
                    sessionStorage.setItem("reporter", JSON.stringify(reporter));
                    sessionStorage.setItem("manageActiveTab", "report");
                    this.$router.push("/write");
                }).catch(err => { console.log(err) })
        },
        waitForReporterData() {
            // 檢查是否有報告數據可用
            if (sessionStorage.getItem('reporterData')) {
                // 如果可用，設置 reporterData
                this.reporterData = JSON.parse(sessionStorage.getItem('reporterData'));
            } else {
                // 如果不可用，等待一段時間後再次檢查
                setTimeout(this.waitForReporterData, 1000); // 延遲 1 秒後再次檢查
            }
        }
    },
    created() {
        // 檢查是否有報告數據可用
        if (sessionStorage.getItem('reporterData')) {
            // 如果可用，設置 reporterData
            this.reporterData = JSON.parse(sessionStorage.getItem('reporterData'));
            this.reporterList = this.reporterData.reporterList;
            for (let i = 0; i < this.reporterData.dataCount / 10; i++) {
                this.page.push(i)
            }
            this.selectedIndex = 0;
        } else {
            // 如果不可用，等待數據可用後再設置
            setTimeout(this.waitForReporterData.bind(this), 1000); // 延遲 1 秒後再次檢查
        }
    },
    mounted() {

    },
}
</script>
<template>
    <div class="report" v-if="isActive">
        REPORTER
        <div class="reporter-area">
            <div class="row row-header">
                <div class="col number">#</div>
                <div class="col reporter">填寫人</div>
                <div class="col time">填寫時間</div>
                <div class="col goreport">詳細</div>
            </div>
            <div class="row " v-for="(reporter, index) in reporterList">
                <div class="col number">{{ reporter.reporterId }}</div>
                <div class="col reporter">{{ reporter.name }}</div>
                <div class="col time">{{ reporter.reportTime.substring(0, 10) }}</div>
                <div class="col goreport"> <span class="go-report" @click="seeReport(reporter)">觀看</span> </div>
            </div>
        </div>
        <div class="page-area">
            <button class="page-btn page" @click="backPage" v-if="selectedIndex > 0">&#60;</button>
            <button class="page-btn page" v-for="(p, index) in page" @click="changePage(index)"
                :class="{ 'selected': selectedIndex === index }">{{ p + 1 }}</button>
            <button class="page-btn page" @click="nextPage" v-if="selectedIndex + 1 < page.length">&#62;</button>
        </div>
    </div>
    <div class="no-report" v-else>
        <h1>問卷尚未開放</h1>
    </div>
</template>
<style lang="scss" scoped>
.report {
    border: 1px solid black;
    padding: 16px;
    width: 768px;
    height: 516px;
    position: relative;

    .reporter-area {
        border: 1px solid black;

        .row {
            width: 100%;
            margin: 0;


            &:nth-child(even) {
                background-color: aliceblue;
            }

            .col {
                border-right: 1px black solid;
            }
        }

        .row-header {
            border-bottom: 1px solid black;
        }

        .number {
            max-width: 64px;
        }

        .go-report {
            cursor: pointer;
            color: blue;
            border-bottom: 1px solid blue;

            &:hover {
                color: black;
            }
        }
    }

    .page-area {
        display: flex;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);

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

}
</style>