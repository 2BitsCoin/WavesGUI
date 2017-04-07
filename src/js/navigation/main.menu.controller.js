(function () {
    'use strict';

    function MainMenuController($scope, $interval, events, applicationContext,
                                cryptoService, dialogService, notificationService, apiService) {
        var refreshPromise, delayRefresh = 10 * 1000;
        var menu = this;

        menu.blockHeight = 0;
        menu.address = applicationContext.account.address;

        function initializeBackupFields() {
            menu.seed = applicationContext.account.seed;
            menu.encodedSeed = cryptoService.base58.encode(converters.stringToByteArray(menu.seed));
            menu.publicKey = applicationContext.account.keyPair.public;
            menu.privateKey = applicationContext.account.keyPair.private;
        }

        function buildBackupClipboardText() {
            var text = 'Seed: ' + menu.seed + '\n';
            text += 'Encoded seed: ' + menu.encodedSeed + '\n';
            text += 'Private key: ' + menu.privateKey + '\n';
            text += 'Public key: ' + menu.publicKey + '\n';
            text += 'Address: ' + menu.address;

            return text;
        }

        refreshBlockHeight();
        refreshPromise = $interval(refreshBlockHeight, delayRefresh);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        menu.showBackupDialog = showBackupDialog;
        menu.showProfileDialog = showProfileDialog;
        menu.backup = backup;

        function showProfileDialog () {
            $scope.$broadcast(events.NAVIGATION_CREATE_ALIAS, {});
        }

        function showBackupDialog() {
            initializeBackupFields();
            dialogService.open('#header-wPop-backup');
        }

        function backup() {
            var clipboard = new Clipboard('#backupForm', {
                text: function (trigger) {
                    return buildBackupClipboardText();
                }
            });
            clipboard.on('success', function(e) {
                notificationService.notice('Account backup has been copied to clipboard');
                e.clearSelection();
            });
            angular.element('#backupForm').click();
            clipboard.destroy();
        }

        function refreshBlockHeight() {
            apiService.blocks.height().then(function (response) {
                menu.blockHeight = response.height;
                applicationContext.blockHeight = response.height;
            });
        }
    }

    MainMenuController.$inject = ['$scope', '$interval', 'navigation.events', 'applicationContext',
        'cryptoService', 'dialogService', 'notificationService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('mainMenuController', MainMenuController);
})();
