(function () {
    /*********
     * INDEX *
     *********/
    // 1. GLOBAL VARIABLES
    // 2. FUNCTIONS
    // 3. MAIN
    // 4. EVENTS

    /***********************
     * 1. GLOBAL VARIABLES *
     ***********************/
    const MIN_QTA = 2;
    const local = {
        save: (id, data) => {
            return localStorage.setItem(id, JSON.stringify(data));
        },
        get: (id) => {
            return JSON.parse(localStorage.getItem(id));
        }
    };


    /****************
     * 2. FUNCTIONS *
     ****************/

    const getPlayers = () => {
        return new Promise((resolve, reject) => {
            if (local.get('players')) {
                resolve(local.get('players'));
            } else {
                $.ajax({
                    url: 'config/players.json',
                    type: 'GET',
                    success: (res) => {
                        local.save('players', res);
                        resolve(res);
                    },
                    error: (err) => {
                        console.log(err);
                        reject(err);
                    }
                });
            }
        });
    };


    const createTableRows = (tableId, data) => {
        let head = '<tr>';
        let body = '';

        data.map((item, i) => {
            if (item.qta >= MIN_QTA) {
                body += `<tr data-id="${item.id}">`;
                Object.keys(item).map((key) => {
                    if ((key !== 'id') && (key !== 'qti') && (key !== 'diff') && (key !== 'status_info')) {
                        if (i === 0) {
                            head += `<th>${key.toUpperCase()}</th>`;
                        }
                        body += `<td>${item[key]}</td>`;
                    }
                });
                body += `<td>
                            <button type="button" class="btn btn-primary btn-floating btn-sm share-btn">
                                <i class="fas fa-share-square"></i>
                            </button>
                         </td></tr>`;
            }
        });
        head += '<th></th></tr>';

        $(`#${tableId} > thead`).html(head);
        $(`#${tableId} > tbody`).html(body);
    };

    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
            v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    const toggleRoleBtnBg = (target, htmlClass) => {
        let isActive = false;

        !target.hasClass('btn-light') ? isActive = true : isActive;

        target.toggleClass('btn-light');
        target.toggleClass(htmlClass);

        return isActive;
    };

    const toggleBtnClassByRole = (btn, role) => {
        return new Promise((resolve, reject) => {
            let isActive = false;

            switch (role) {
                case "por":
                    isActive = toggleRoleBtnBg(btn, 'btn-warning');
                    break;
                case "ds":
                case "dc":
                case "dd":
                    isActive = toggleRoleBtnBg(btn, 'btn-success');
                    break;
                case "e":
                case "m":
                case "c":
                    isActive = toggleRoleBtnBg(btn, 'btn-primary');
                    break;
                case "w":
                case "t":
                    isActive = toggleRoleBtnBg(btn, 'btn-secondary');
                    break;
                case "a":
                case "pc":
                    isActive = toggleRoleBtnBg(btn, 'btn-danger');
                    break;
            }

            resolve(isActive);
        });
    };

    const resetRoleBtns = (currentBtn) => {
        $('.role-button').not(currentBtn).each((i, el) => {
            if (!$(el).hasClass('btn-light')) {
                $(el).removeClass();
                $(el).addClass('btn btn-light btn-floating btn-sm role-button');
            }
        });
    };

    /***********
     * 3. MAIN *
     ***********/

    getPlayers().then((players) => {
        createTableRows('players-list', players);
    });

    /*************
     * 4. EVENTS *
     *************/

    $(document).on('click', '.share-btn', function () {
        console.log();
        let role = $($(this).parent().parent().children()[0]).text();
        let name = $($(this).parent().parent().children()[1]).text();
        let id = $($(this).parent().parent()).data('id');


        $('#insert-player').val(name).data('role', role).focus();
        console.log(name, id);
    });

    $('#buy-player').on('click', () => {
        let name = $('#insert-player').val();
        let amount = $('#insert-amount').val();
        let role = $('#insert-player').data('role').split(';');
        let squadRole = '';
        let chipColor = '';
        let currentTotal = Number($('#fanta-credits > span').html());
        let finalTotal = currentTotal - amount;

        switch (role[0].toLowerCase()) {
            case "por":
                squadRole = 'squad-p';
                chipColor = 'btn-warning';
                break;
            case "ds":
            case "dc":
            case "dd":
                squadRole = 'squad-d';
                chipColor = 'btn-success';
                break;
            case "e":
            case "m":
            case "c":
                squadRole = 'squad-c';
                chipColor = 'btn-primary';
                break;
            case "w":
            case "t":
                squadRole = 'squad-t';
                chipColor = 'btn-secondary';
                break;
            case "a":
            case "pc":
                squadRole = 'squad-a';
                chipColor = 'btn-danger';
                break;
        }

        $(`#${squadRole}`).after(`<button type="button" class="btn ${chipColor} btn-block squad-chip active">
                                        ${role.map((item) => {
            let badgeColor = '';
            switch (item.toLowerCase()) {
                case "por":
                    badgeColor = 'btn-warning';
                    break;
                case "ds":
                case "dc":
                case "dd":
                    badgeColor = 'btn-success';
                    break;
                case "e":
                case "m":
                case "c":
                    badgeColor = 'btn-primary';
                    break;
                case "w":
                case "t":
                    badgeColor = 'btn-secondary';
                    break;
                case "a":
                case "pc":
                    badgeColor = 'btn-danger';
                    break;
            }
            return `<span class="badge ${badgeColor} border border-dark ml-2">${item.toUpperCase()}</span>`
        })} ${name} <span class="badge btn-light border border-dark ml-2"><i class="fas fa-coins"></i> ${amount}</span>
                                    </button>`);
        $('#fanta-credits > span').html(finalTotal);
        console.log(currentTotal);
        console.log(finalTotal);
        console.log(name, role, role[0], squadRole, amount);
    });

    $("#search-player").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        if (value && value !== "") {
            resetRoleBtns();
        }
        $("#players-list tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $('.role-button').on('click', (e) => {
        let btn = $(e.currentTarget);
        let role = $(e.currentTarget.children[1]).text().toLowerCase();

        resetRoleBtns(btn);

        toggleBtnClassByRole(btn, role).then((isActive) => {
            $("#players-list tbody tr").filter(function () {
                let roleCell = $($(this)[0].children[0]);
                $(this).toggle(roleCell.text().toLowerCase().indexOf(isActive ? "" : role) > -1);
            });
        });
    });


    $('#insert-amount').on('keyup', function () {
        if ($(this).val() && $(this).val() > 0) {
            $('#buy-player').removeClass('disabled');
        } else {
            $('#buy-player').addClass('disabled');
        }
    });

    $(document).on('click', 'th', (e) => {
        const table = e.target.closest('table');

        Array.from(table.querySelectorAll('tbody > tr'))
            .sort(comparer(Array.from(e.target.parentNode.children).indexOf(e.target), this.asc = !this.asc))
            .forEach(tr => document.querySelector('table > tbody').appendChild(tr));
    });
})();