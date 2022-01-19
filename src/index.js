"use strict";

import _ from "lodash";
import "./css/main.less";
// import "./css/normalize.css";
// import "./js/vendor/modernizr-3.11.2.min.js";
// import "./js/vendor/plugins.js";
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
  let currentData = vocab;

  const resultsDiv = "#results";
  const NAME_MINRANGE = "min";
  const NAME_MAXRANGE = "max";

  /**
   * Fetches data from json file
   * @param {*} useMock - always true because no API
   * @param {*} template - e.g. #resultsTemplate-hiragana
   */
  const getData = (useMock, template) => {
    if (useMock) {
      // update range bars
      updateRangeBars(NAME_MINRANGE, 1, vocab.length);
      updateRangeBars(NAME_MAXRANGE, 1, vocab.length);
      //generate html
      generateCards(vocab, template);
    }
  };

  /**
   * Generate HTML into results div. The data should be an array of json items
   * @param {*} data
   * @param {*} mode e.g. #resultsTemplate-hiragana
   */
  const generateCards = (data, mode) => {
    if (data.length == 0) return;
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

    // setTimeout(() => {
    //   $("#main-spinner").hide();
    //   $("#main-body").removeAttr("style");
    // }, 200);

    // reveal the hidden contents on click of the card
    $(".flashcard").click((e) => {
      const $hiddenDivs = $(e.currentTarget).find(".flashcard__target");
      if ($hiddenDivs.hasClass("hidden")) $hiddenDivs.removeClass("hidden");
      else $hiddenDivs.addClass("hidden");
    });
  };

  /**
   *
   * @param {string} rangeType - 'min' or 'max'
   * @param {number} min
   * @param {number} max
   */
  const updateRangeBars = (rangeType, min, max) => {
    const minSelector = "#minRange";
    const maxSelector = "#maxRange";
    let selector = "";

    if (!rangeType) return;
    else if (rangeType === NAME_MINRANGE) selector = minSelector;
    else if (rangeType === NAME_MAXRANGE) selector = maxSelector;

    if (min && min > 0) $(selector).attr(NAME_MINRANGE, min);
    if (max && max > 0) $(selector).attr(NAME_MAXRANGE, max);
  };

  const init = () => {
    //check if has mode cookie and use that mode
    // let currentMode = N2PrepUtils.getCookie("mode");
    if (!currentMode) currentMode = practiceDefault;
    getData(useMockVocab, resultsTemplateStr + "-" + currentMode);

    //search bar filter, filters current visible data
    $("#searchFilter").on("input", (e) => {
      let searchTerm = e.currentTarget.value;
      const engTest = /^[A-Za-z]*$/;
      let isEng = engTest.test(searchTerm);
      let filteredArr = [];

      // optimize by only triggering filter if value is not empty and length > 3 for non-eng search terms
      if (isEng && searchTerm.length < 4 && searchTerm) {
        return;
      } else if (searchTerm.length == 0) {
        //don't return results if nothing entered else need render all the cards
        filteredArr = [];
      } else {
        filteredArr = vocab.filter((item) => {
          //if searchterm is english, match by definition only
          if (isEng) {
            return item.Definition.indexOf(searchTerm) > -1;
          } else {
            //if search term is not english match by hiragana or kanji
            return (
              item.Hiragana.indexOf(searchTerm) > -1 ||
              item.Kanji.indexOf(searchTerm) > -1
            );
          }
        });
      }

      // N2PrepUtils.createCookie("mode", mode, 7);
      $(resultsDiv).empty();
      generateCards(filteredArr, resultsTemplateStr + "-" + currentMode);
      console.debug(
        "Filtering by word: " + searchTerm + " | currentMode: " + currentMode
      );
    });

    // filter drawer elements
    const $minRangeSlider = $("#minRange");
    const $maxRangeSlider = $("#maxRange");
    const $minRangeField = $("#manualMin");
    const $maxRangeField = $("#manualMax");
    const $practiceModeDdl = $("#practiceMode");

    $practiceModeDdl.val(currentMode);

    //init practiceMode ddl event, resets data to full data set
    $practiceModeDdl.change((e) => {
      let mode = e.currentTarget.value;
      N2PrepUtils.createCookie("mode", mode, 7);
      currentMode = mode;
      $("#searchFilter").val("");
      console.info("Practice Mode changed to " + mode);
    });

    // filter drawer button event
    $("#startFilter").click((e) => {
      let minRangeVal = $minRangeField.val();
      let maxRangeVal = $maxRangeField.val();

      //reset and generate data
      let filteredArr = vocab.filter((item) => {
        return item.SN >= minRangeVal && item.SN <= maxRangeVal;
      });
      $(resultsDiv).empty();
      generateCards(filteredArr, resultsTemplateStr + "-" + currentMode);
      $(".navbar-toggler").trigger("click");
    });

    //range bar events
    $minRangeField.change((e) => {
      $minRangeSlider.val(e.currentTarget.value);
      $minRangeSlider.trigger("change");
    });
    $minRangeSlider.change((e) => {
      const $maxRange = $maxRangeSlider;
      e.currentTarget.previousElementSibling.value = e.currentTarget.value;
      //min value changed, set maxRange's min value
      $maxRange.attr(NAME_MINRANGE, e.currentTarget.value);
    });
    $maxRangeField.change((e) => {
      $maxRangeSlider.val(e.currentTarget.value);
      $maxRangeSlider.trigger("change");
    });
    $maxRangeSlider.change((e) => {
      const $minRange = $minRangeSlider;
      e.currentTarget.previousElementSibling.value = e.currentTarget.value;
      //max value changed, set minRange's max value
      $minRange.attr(NAME_MAXRANGE, e.currentTarget.value);
    });
  };

  return {
    init: init,
  };
})();

n2Prep.init();
