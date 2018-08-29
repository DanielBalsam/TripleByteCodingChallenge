(function() {
  'use strict';

  angular.module('BoilerPlate')
    .service('kanbanService', kanbanService);

    kanbanService.$inject = ['$http'];

    function kanbanService($http) {
      var me = this;
      me.takeKanbanAction = takeKanbanAction;
      me.undoLastAction = undoLastAction;

      init();

      function init() {
        me.kanbanData = {
          cols : [
            {
              name: 'Winnie',
              rows: [
                'Buy eggs from the grocery store. Need at least two dozen',
                'Another row for Winnie'
              ]
            },
            {
              name: 'Bob',
              rows: [
                'Finish cleaning basement before roommates come home',
                'Another row for Bob'
              ]
            },
            {
              name: 'Thomas',
              rows: [
                "Finish packing for Hawaii Trip. Don't forget to bring sunscreen!",
                'Another row for Thomas'
              ]
            },
            {
              name: 'George',
              rows: [
                'Pay electricity bills before the 10th.',
                'Another row for George'
              ]
            }
          ],
          actionHistory: []
        };

        getSavedKanbanData();
      }

      function getSavedKanbanData() {
        $http.get('api/kanban')
          .then(function(res) {
            if (res.data) {
              me.kanbanData.cols = res.data.cols;
            }
          })
      }

      function takeKanbanAction(actionType, actionArguments) {
        var newActionIndex;

        if (actionType === "addItem") {
          newActionIndex = addItem(actionArguments);
        } else if (actionType === "moveTask") {
          newActionIndex = moveTask(actionArguments);
        }

        me.kanbanData.actionHistory.push({
          actionType: actionType,
          actionArguments: actionArguments,
          undoCallback: function() {
            if (actionType === "addItem") {
              me.kanbanData.cols[actionArguments.index].rows.splice(newActionIndex, 1);
            } else if (actionType === "moveTask") {
              var undoArguments = {
                currentColumnIndex: actionArguments.newColumnIndex,
                newColumnIndex: actionArguments.currentColumnIndex,
                row: newActionIndex
              };

              moveTask(actionArguments);
            }
          }
        });

        console.log(me.kanbanData);
      }

      function undoLastAction() {
        if (me.kanbanData.actionHistory.length > 0) {
          me.kanbanData.actionHistory[me.kanbanData.actionHistory.length - 1].undoCallback();
        }
      }

      function addItem(actionArguments) {
        var newRow = window.prompt("Please enter new item for " + actionArguments.name);

        if (newRow) {
          me.kanbanData.cols[actionArguments.index].rows.push(newRow);

          updateSavedKanbanData();

          return me.kanbanData.cols[actionArguments.index].rows.length - 1;
        }
      }

      function moveTask(actionArguments) {
        var row = me.kanbanData.cols[actionArguments.currentColumnIndex].rows.splice(actionArguments.rowIndex, 1)[0];
        me.kanbanData.cols[actionArguments.newColumnIndex].rows.push(row);

        updateSavedKanbanData();

        return me.kanbanData.cols[actionArguments.newColumnIndex].rows.length - 1;
      }

      function updateSavedKanbanData() {
        $http.post('api/kanban', me.kanbanData)
          .then(function(res) {
          });
      }
    }
})();
