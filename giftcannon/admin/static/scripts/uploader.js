(function (root) {
  root.create_uploader = function (container) {
    var node = $("#" + container)
      , uploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,gears,html4',
        browse_button: container + '-pickfiles',
        container: container,
        max_file_size: '10mb',
        multi_selection: false,
        url: '/api/resources/picture',
        flash_swf_url: '/crm/static/scripts/plupload/js/plupload.flash.swf',
        silverlight_xap_url: '/crm/static/scripts/plupload/js/plupload.silverlight.xap',
        filters: [
            { title: "Image files", extensions: "jpg,gif,png" }
          ]
      });
    uploader.bind('Init', function (up, params) { window.up = up; node.find('.filelist').html(""); });

    node.find('.uploadfiles').click(function (e) {
      uploader.start();
      e.preventDefault();
    });

    uploader.init();

    uploader.bind('FilesAdded', function (up, files) {
      _.each(_.filter(up.files, function (file) { return !_.include(files, file) }), function (file) { up.removeFile(file); });

      $.each(files, function (i, file) {
        node.find('.filelist').html(
          '<div id="' + file.id + '">' +
          file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
        '</div>');
      });
      up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.bind('UploadProgress', function (up, file) {
      $('#' + file.id + " b").html(file.percent + "%");
    });

    uploader.bind('Error', function (up, err) {
      node.find('.filelist').append("<div>Error: " + err.code +
            ", Message: " + err.message +
            (err.file ? ", File: " + err.file.name : "") +
            "</div>"
          );
      up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.bind('FileUploaded', function (up, file, xhr) {
      var resp = JSON.parse(xhr.response), rr = sprints8.resource_resolver;
      file_id = resp.Upload.file;
      $('#' + file.id + " b").remove();
      $('#' + file.id).html(file_id).append('<img src="' + rr.url(file_id) + '"/>');
      $("#" + container).find(".file-target").val(file_id);
    });
  };
})(window);