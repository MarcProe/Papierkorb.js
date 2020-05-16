//init a lot of stuff
$(document).ready(function () {
  function redsave() {
    $("#save").removeClass("blue").removeClass("red").addClass("red");
  }

  $("select").formSelect();

  let idregex = /.*(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.\d{3}Z\.pdf).*/g;
  let docid = idregex.exec(window.location.href)[1];

  $.getJSON("/api/v1/doc/" + docid, function (docdata) {
    //Initialize Datepicker
    $(".datedoc").datepicker({
      onStart: function () {
        let docdatesel = $("#docdate");
        year = moment.utc(docdatesel.val(), "DD.MM.YYYY").format("YYYY");
        month = moment.utc(docdatesel.val(), "DD.MM.YYYY").format("MM");
        day = moment.utc(docdatesel.val(), "DD.MM.YYYY").format("DD");
        this.set(year, month, day);
      },
      onOpen: function () {
        $("#docdate").removeClass("red-text");
        redsave();
      },
      format: "dd.mm.yyyy",
      selectMonths: true,
      selectYears: 15,
      today: "Heute",
      clear: "L&ouml;schen",
      close: "Ok",
      closeOnSelect: true,
      monthsFull: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      monthsShort: [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez",
      ],
      weekdaysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      firstDay: 1,
      min: false,
      max: 365,
    });

    //Initialize Editcol Button
    var instances = M.FloatingActionButton.init(
      document.querySelectorAll(".fixed-action-btn"),
      {
        direction: "left",
      }
    );

    //Initialize Partner Autocomplete
    $.getJSON("/api/v1/partners", function (partnerlist) {
      let plist = {};
      for (index = 0; index < partnerlist.length; ++index) {
        plist[partnerlist[index].name] = partnerlist[index].logo;
      }

      let partnersel = $("#partner");
      partnersel.autocomplete({
        data: plist,
        limit: 20,
        onAutocomplete: function (val) {
          redsave();
        },
        minLength: 1,
      });

      partnersel.on("click", function () {
        $(this).val("");
        $(this).removeClass("red-text");
        redsave();
      });
    });

    //Initialize modal delete dialogue
    let modaldeletesel = $("#modaldelete");
    modaldeletesel.modal();
    $("#canceldelete").on("click", function () {
      modaldeletesel.modal("close");
    });

    //Fix page header column height
    $("#editcol").css({
      height: +$("#pageheadercol").height(),
    });

    //delete preview "are you sure"
    $(".deletepreview").on("click", function () {
      let page = this.id.split("_").pop();
      M.Toast.dismissAll();
      let toastContent =
        '<i class="material-icons medium white-text">delete_forever</i>' +
        '<a href="/doc/' +
        docdata._id +
        "/delete/" +
        page +
        "?previews=" +
        docdata.previews +
        '" class="btn-flat toast-action">Sicher?</a>';
      M.toast({ html: toastContent, displayLength: 10000, classes: "rounded" });
    });

    //tag chips
    $.getJSON("/api/v1/tags", function (taglist) {
      taglist = taglist.sort(function (a, b) {
        return a._id > b._id ? 1 : b._id > a._id ? -1 : 0;
      });

      let seltags = [];
      if (docdata.tags) {
        docdata.tags.forEach(function (tag) {
          seltags.push({ tag: tag });
        });
      }

      let tags = {};
      let tagtooltip = "";
      if (taglist) {
        taglist.forEach(function (tag) {
          tags[tag._id] = null;
          tagtooltip += tag._id + ", ";
        });
      }

      let tagstooltipsel = $("#tagstooltip");
      tagstooltipsel.attr(
        "data-html",
        '<div class="flow-text">' + tagtooltip + "</div>"
      );
      tagstooltipsel.tooltip({ delay: 50 });

      let hiddentagssel = $("#hidden_tags");
      hiddentagssel.val(JSON.stringify(seltags)); //store array

      let chips = document.querySelectorAll(".chips");

      M.Chips.init(chips, {
        data: seltags,
        placeholder: "Tags eingeben",
        secondaryPlaceholder: "Mehr Tags",
        autocompleteOptions: {
          data: tags,
          limit: Infinity,
          minLength: 1,
        },
        onChipAdd: function (e, chip) {
          hiddentagssel.val(JSON.stringify(chips[0].M_Chips.chipsData));
          console.log(document.querySelectorAll(".chips")[0].M_Chips.chipsData);
          redsave();
        },
        onChipDelete: function (e, chip) {
          hiddentagssel.val(JSON.stringify(chips[0].M_Chips.chipsData));
          console.log(document.querySelectorAll(".chips")[0].M_Chips.chipsData);
          redsave();
        },
      });
    });

    //init unveil
    let imgsel = $("img");
    imgsel.unveil(50, function () {
      //noop
    });

    $("#ocr1").on("click", function () {
      ocr(0, docdata);
    });

    setTimeout(function () {
      $(".previewcontainer").css("min-height", "0px");
    }, 600);

    //load a placeholder if preview image is not (yet) created
    imgsel.on("error", function () {
      $(this).unbind("error");
      $(this).attr("src", "/images/papierkorb-logo.png");
    });

    //reloadpreview button
    $(".reloadpreview").on("click", function () {
      let image = $(this).attr("data-id");
      let numimagesel = $("#" + image);
      let src = numimagesel.attr("data-src");
      numimagesel.attr("src", src + "?timestamp=" + new Date().getTime());
    });

    //rotateleft button
    $(".rotateleft").on("click", function () {
      let image = $(this).attr("data-id");
      $("#" + image).css({
        "-webkit-transform": "rotate(-90deg)",
        "-moz-transform": "rotate(-90deg)",
        transform: "rotate(-90deg)" /* For modern browsers(CSS3)  */,
      });
    });

    //rotateright button
    $(".rotateright").on("click", function () {
      let image = $(this).attr("data-id");
      $("#" + image).css({
        "-webkit-transform": "rotate(90deg)",
        "-moz-transform": "rotate(90deg)",
        transform: "rotate(90deg)" /* For modern browsers(CSS3)  */,
      });
    });

    //rotate180 button
    $(".rotate180").on("click", function () {
      let image = $(this).attr("data-id");
      $("#" + image).css({
        "-webkit-transform": "rotate(180deg)",
        "-moz-transform": "rotate(180deg)",
        transform: "rotate(180deg)" /* For modern browsers(CSS3)  */,
      });
    });

    //rotateback button
    $(".rotateback").on("click", function () {
      let image = $(this).attr("data-id");
      $("#" + image).css({
        "-webkit-transform": "rotate(0deg)",
        "-moz-transform": "rotate(0deg)",
        transform: "rotate(0deg)" /* For modern browsers(CSS3)  */,
      });
    });

    if ($(".doctext").val() === "") {
      //ocr(0, docdata);
    }
  });

  $("#save").on("click", function () {
    let docdata = {};

    docdata.subject = $("#subject").val().trim();
    docdata.partner = $("#partner").val().trim();
    docdata.docdate = $("#docdate").val();
    docdata.lang = $("#lang option:selected").val();
    let tags = document.querySelectorAll(".chips")[0].M_Chips.chipsData;
    docdata.tags = [];
    $.each(tags, function (key, value) {
      if (value.tag && value.tag !== "") {
        docdata.tags.push(value.tag);
      }
    });
    if (docdata.tags.length === 0) {
      delete docdata.tags;
    }
    docdata.users = [];
    $('input:checked[name="users"]').each(function () {
      if ($(this).val() && $(this).val() !== "") {
        docdata.users.push($(this).val());
      }
    });
    if (docdata.users.length === 0) {
      delete docdata.users;
    }

    $.post(
      "/api/v1/doc/" + docid + "/",
      $.param(docdata, true),
      function (data, status) {
        if (status === "success") {
          $("#save").removeClass("red").removeClass("blue").addClass("blue");
          $("#saveicon").text("done");
          M.toast({ html: "Gespeichert.", displayLength: 4000 });
          setTimeout(function () {
            $("#saveicon").text("save");
          }, 2000);
        } else {
          M.toast({ html: "Fehler: " + status, displayLength: 4000 });
        }
      },
      "json"
    );
  });

  $("#partner,#subject").on("input", function () {
    redsave();
  });

  $(".jqusers").on("click", function () {
    redsave();
  });

  $("#lang").on("change", function () {
    redsave();
  });
});
