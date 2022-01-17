"use strict";

import _ from "lodash";
import "./css/main.less";
import "./css/normalize.css";
import "./js/vendor/modernizr-3.11.2.min.js";
import "./js/vendor/plugins.js";
import vocab from "./data/vocab.json";
import N2PrepUtils from "./js/utils";

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const useMockVocab = true;

const n2Prep = (function () {
  const resultsTemplateStr = "#resultsTemplate";
  const practiceHiragana = resultsTemplateStr + "-hiragana";
  const practiceKanji = resultsTemplateStr + "-kanji";
  const practiceEng = resultsTemplateStr + "-eng";
  const practiceDefault = practiceEng;

  const resultsDiv = "#results";

  const getData = (useMock, template) => {
    if (useMock) {
      generateCards(vocab, template);
    } else {
      $.get("data/vocab.json", (data) => {
        generateCards(data, template);
      });
    }
  };

  /**
   * Generate HTML into results div
   * @param {*} data
   * @param {*} mode e.g. #resultsTemplate-hiragana
   */
  const generateCards = (data, mode) => {
    let resultsTemplate = $(mode).html();
    let resultsDiv = document.getElementById("results");

    let cardTemplateFn = _.template(resultsTemplate);
    let resultList = data;

    _.forEach(resultList, function (result) {
      let templateHTML = cardTemplateFn(result);
      if (mode === practiceKanji && !result.Kanji) return; //skip items with no kanji if mode is kanji
      resultsDiv.innerHTML += templateHTML;
    });

    // reveal the hidden contents on click of the card
    $(".flashcard").click((e) => {
      const $hiddenDivs = $(e.currentTarget).find(".card-text");
      if ($hiddenDivs.hasClass("hidden")) $hiddenDivs.removeClass("hidden");
      else $hiddenDivs.addClass("hidden");
    });
  };

  const init = () => {
    //check if has mode cookie and use that mode
    let currentMode = N2PrepUtils.getCookie("mode");
    if (!currentMode) currentMode = practiceDefault;
    getData(useMockVocab, resultsTemplateStr + "-" + currentMode);

    //init practiceMode ddl event
    $("#practiceMode").change((e) => {
      let mode = e.currentTarget.value;
      N2PrepUtils.createCookie("mode", mode, 7);
      $(resultsDiv).empty();
      generateCards(vocab, resultsTemplateStr + "-" + mode);
      console.info("Practice Mode changed");
    });
  };

  return {
    init: init,
  };
})();

n2Prep.init();
