/**
 * Created by 7217238 on 04/05/2017.
 */
$(document).ready(function(){
    load_tasks() ;
}) ;


// Load from the server all the current tasks
// and fill the table id="task-list"
function load_tasks() {

    // get the JSON with the list of tasks from the server
    $.ajax(
        '/api/v1.0/tasks',
        {
            method: "GET",
            dataType: "json",
            success: function (data, status) {
                // Replace the table contents with the new data

                // Delete all rows (except the title row)
                $("table#task-list tbody").remove();

                // Add one new row for each data item
                var tasks = data.tasks; // array of tasks
                for (var i = 0; i < tasks.length; i++) {
                    var description = tasks[i].description;
                    var urgent = tasks[i].urgent;
                    var id = tasks[i].id;

                    //create a delete button for each task
                    var delete_button = '<a class="delete btn btn-default" task_id="'+id+'"><span class="glyphicon glyphicon glyphicon-remove"></span>Delete</a>';

                    //create an update button for each task
                    var update_button = '<a class="update btn btn-default" task_id="'+id+'"><span class="glyphicon glyphicon glyphicon-refresh"></span>Update</a>';

                    $("table#task-list").append("<tr><td class='description'>" + description +
                        "</td><td class='urgent'>" + urgent + "</td><td>" +
                        delete_button + " " +
                        update_button + "</td></tr>");
                } // table is complete, now

                //set the actions performed every time a "Delete" button is pressed
                $("a.delete").click(id, function (event) {
                    var task_id=$(this).attr('task_id');
                    delete_task(task_id);
                });


                //set the actions performed every time an "Update" button is pressed
                $("a.update").click(id, function (event) {
                    //get the id from the task_id tag
                    var task_id=$(this).attr('task_id');
                    //get the description and the urgent value from the corresponding cell
                    var description=$(this).closest('tr').children(".description").html();
                    var urgent=$(this).closest('tr').children(".urgent").html();

                    setTextboxForUpdate(task_id, description, urgent);
                });
            }
        }
    );

}

function insertNewTask(event)
{
    var text = $("#description").val();
    var urgent = $("#urgentCheckBox").prop("checked");
    if (text.length>2)
    {
        // insert the new element in the DB
        // POST /api/v1.0/tasks
        var json = {description: text, urgent: urgent};
        $.ajax("/api/v1.0/tasks",
            {
                method: 'POST',

                contentType: 'application/json',
                data: JSON.stringify(json),

                success: function (data, status) {
                    // update the list of printed tasks: called when the INSERT is complete
                    load_tasks();

                    //reset label, textbox, and checkbox for insertion
                    $("label[for='description']").html('Insert a new task');
                    $("input[name='urgent']").prop("checked",false);
                    $("#description").val("");
                }
            }
        );
    }
    else
    {
        $('div#errorbox').text("Description too short").addClass("text-danger");
        $("#description").parent().addClass("has-error");
        window.setTimeout(function () {
            $("#description").parent().removeClass("has-error");
            $('div#errorbox').text("").removeClass("text-danger");
        }, 5000);
    }
    //avoid form submission (the default action of the event)
    event.preventDefault();
}


function delete_task(task_id) {
    // delete the specified task from the DB
    // DELETE /api/v1.0/tasks/:task_id
    $.ajax("/api/v1.0/tasks/"+task_id,
        {
            method: 'DELETE',
            success: function (status) {
                // update the list of printed tasks: called when the DELETE is complete
                load_tasks();
            }
        }
    );
}


function setTextboxForUpdate(task_id, description, urgent) {
    //prepare label, textbox, and checkbox for update
    $("label[for='description']").html('Update the task');
    $("#description").val(description);
    if (urgent == 1)
    {
        $("input[name='urgent']").prop("checked",true);
    }
    else
    {
        $("input[name='urgent']").prop("checked",false);
    }
    //modify the action performed when the "Enter" button is pressed
    $("form[id='add-task']").method = 'PUT';
    $("form[id='add-task']").unbind();
    $("form[id='add-task']").removeAttr('onsubmit'); //it is necessary bacause, otherwise, the function we defined in the HTML will remain active
    $("form[id='add-task']").submit(function (event) {
        updateTask(event, task_id);
    });
}


function updateTask(event, task_id) {
    // Check if valid
    var text = $("#description").val();
    var urgent = $("input[name='urgent']").prop("checked");

    if (text.length>2) {
        // update the element in the DB
        // POST /api/v1.0/tasks/:task_id
        var json = {description: text, urgent: urgent};
        $.ajax("/api/v1.0/tasks/" + task_id,
            {
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(json),

                success: function (data, status) {
                    // update the list of printed tasks: called when the UPDATE is complete
                    load_tasks();

                    //reset label, textbox, and checkbox for insertion
                    $("label[for='description']").html('Insert a new task');
                    $("input[name='urgent']").prop("checked", false);
                    $("#description").val("");
                    //modify the action performed when the "Enter" button is pressed
                    $("form[id='add-task']").method = 'POST';
                    $("form[id='add-task']").unbind();
                    $("form[id='add-task']").removeAttr('onsubmit'); //it is necessary bacause, otherwise, the function we defined in the HTML will remain active
                    $("form[id='add-task']").submit(function (event) {
                        insertNewTask(event);
                    });
                }
            }
        );
    }
    else
    {
        $('div#errorbox').text("Description too short").addClass("text-danger");
        $("#description").parent().addClass("has-error");
        window.setTimeout(function () {
            $("#description").parent().removeClass("has-error");
            $('div#errorbox').text("").removeClass("text-danger");
        }, 5000);

    };

    //avoid form submission (the default action of the event)
    event.preventDefault();

}
