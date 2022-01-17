"use strict";

import _ from "lodash";
import "./css/main.less";
import "./css/normalize.css";
import "./js/vendor/modernizr-3.11.2.min.js";
import "./js/vendor/plugins.js";
import "./js/main";
import vocab from "./data/vocab.json";
import N2PrepUtils from "./js/utils";

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
const useMockVocab = true; //always true for now

const n2Prep = (function () {
  const resultsTemplateStr = "#resultsTemplate";
  const practiceHiragana = resultsTemplateStr + "-hiragana";
  const practiceKanji = resultsTemplateStr + "-kanji";
  const practiceEng = resultsTemplateStr + "-eng";
  const practiceDefault = "eng";
  let currentMode = N2PrepUtils.getCookie("mode");

  const resultsDiv = "#results";

  /**
   * Fetches data from json file
   * @param {*} useMock - always true because no API
   * @param {*} template - e.g. #resultsTemplate-hiragana
   */
  const getData = (useMock, template) => {
    if (useMock) {
      generateCards(vocab, template);
    }
  };

  /**
   * Generate HTML into results div. The data should be an array of json items
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

      //skip item if it doesnt have Hiragana or Definition
      if (!result.Hiragana || !result.Definition) return;
      //skip items with no kanji if mode is kanji
      else if (mode === practiceKanji && !result.Kanji) return;
      //skip items with no kanji if mode is hiragana
      else if (mode === practiceHiragana && !result.Kanji) return;
      resultsDiv.innerHTML += templateHTML;
    });

    // reveal the hidden contents on click of the card
    $(".flashcard").click((e) => {
      const $hiddenDivs = $(e.currentTarget).find(".flashcard__target");
      if ($hiddenDivs.hasClass("hidden")) $hiddenDivs.removeClass("hidden");
      else $hiddenDivs.addClass("hidden");
    });
  };

  const init = () => {
    //check if has mode cookie and use that mode
    // let currentMode = N2PrepUtils.getCookie("mode");
    if (!currentMode) currentMode = practiceDefault;
    getData(useMockVocab, resultsTemplateStr + "-" + currentMode);

    //init practiceMode ddl event
    $("#practiceMode").change((e) => {
      let mode = e.currentTarget.value;
      N2PrepUtils.createCookie("mode", mode, 7);
      $(resultsDiv).empty();
      generateCards(vocab, resultsTemplateStr + "-" + mode);
      currentMode = mode;
      console.info("Practice Mode changed to " + mode);
    });

    //search bar filter
    $("#searchFilter").on("input", (e) => {
      let searchTerm = e.currentTarget.value;
      const engTest = /^[A-Za-z]*$/;
      let isEng = engTest.test(searchTerm);
      let filteredArr = vocab.filter((item) => {
        //if searchterm is english, match by definition only
        if (isEng) {
          console.debug("match by definition");
          return item.Definition.indexOf(searchTerm) > -1;
        } else {
          //if search term is not english match by hiragana or kanji
          console.debug("match by jap");

          return (
            item.Hiragana.indexOf(searchTerm) > -1 ||
            item.Kanji.indexOf(searchTerm) > -1
          );
        }
      });
      // N2PrepUtils.createCookie("mode", mode, 7);
      $(resultsDiv).empty();
      generateCards(filteredArr, resultsTemplateStr + "-" + currentMode);
      console.debug(
        "Filtering by word: " + searchTerm + " | currentMode: " + currentMode
      );
    });
  };

  return {
    init: init,
  };
})();

n2Prep.init();
