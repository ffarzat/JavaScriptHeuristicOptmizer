var myApp = angular.module('myApp', ['ng-admin']);
myApp.config(['NgAdminConfigurationProvider', function (NgAdminConfigurationProvider) {
    var nga = NgAdminConfigurationProvider;
    // create an admin application
    var admin = nga.application('JavaScript Heuristic Optmizer Status, Results and Configurations')
        .debug(false) // debug disabled
        .baseApiUrl('http://localhost:5000/'); // main API endpoint;



    var LogLine = nga.entity('LogLine');
    var Config = nga.entity('Config');
    var Results = nga.entity('Results');
    var Status = nga.entity('Status');

    admin.addEntity(Status);
    admin.addEntity(LogLine);

    Status.readOnly();                  // a readOnly entity has disabled creation, edition, and deletion views

    Status.showView()
        .fields([
            nga.field('Log', 'referenced_list') // display list of related Log Lines
                .targetEntity(nga.entity('LogLine'))
                .targetReferenceField('status_id')
                .targetFields([
                    nga.field('Date'),
                    nga.field('Text').label('Info')
                ])
                .sortField("Date")
        ]);

    admin.menu(nga.menu()
        .addChild(nga.menu(LogLine).title('Log File').link('/logfile'))
        .addChild(nga.menu(Config).title('Config File').link('/configfile'))
        .addChild(nga.menu(Results).title('Results').link('/resultslist'))
    );


    // customize dashboard
    var customDashboardTemplate =
        '<div class="row dashboard-starter"></div>' +
        '<div class="row dashboard-content"><div class="col-lg-12"><div class="alert alert-info">' +
        'Server Status: Online' +
        '</div></div></div>' +
        '<div class="row dashboard-content">' +
        '<div class="col-lg-12">' +
        '<div class="panel panel-default">' +
        '<ma-dashboard-panel collection="dashboardController.collections.Status" entries="dashboardController.entries.Status" datastore="dashboardController.datastore"></ma-dashboard-panel>' +
        '</div>' +
        '</div>' +
        '</div>';


    admin.dashboard(nga.dashboard()
        .addCollection(nga.collection(Status)
            .title('Status')
            .perPage(1)
            .fields([
                nga.field('Time').label('Server Time'),
                nga.field('Messages').label('Messages waiting'),
                nga.field('WaitingMessages').label('Messages in process'),
                nga.field('Clients').label('Free Clients'),
                nga.field('ClientProcessing').label('Clients working')
            ])
            .listActions(['show'])
        )
        .template(customDashboardTemplate)
    );

    // attach the admin application to the DOM and run it
    nga.configure(admin);
}]);