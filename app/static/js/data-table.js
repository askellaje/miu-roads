$(document).ready(function() {
	$('#big-table').DataTable({
		"language": {
			"search": "Пошук по всіх колонках",
			"lengthMenu": "Кількість рядків _MENU_",
			"paginate": {
				"previous": `<i class="tim-icons icon-minimal-left"></i>`,
				"next": `<i class="tim-icons icon-minimal-right"></i>`
			}
		},
		"bInfo" : false,
		"sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>'
	});

	var inp = $('#big-table_filter input').addClass('form-control');
	inp.attr("placeholder", "Автомагістраль");

	var select = $('#big-table_length select').addClass('form-control');

	$('div.row.view-pager div.col-sm-12').addClass('d-flex justify-content-center');
});